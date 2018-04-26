import * as moo from 'moo'

export type typeElement =
    'div'
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'p'
    | 'ul' | 'ol' | 'li'
    | 'b' | 'i'

export type typeVal = '' | '$$' | '$'
export type typeLink = 'a' | 'img'

export interface kids {
    kids: node[]
}

export interface element extends kids {
    type: typeElement
}

export interface br {
    type: 'br'
}

export interface val {
    type: typeVal
    val: string
}

export interface link {
    type: typeLink
    title: string
    href: string
}

export type node = element | val | link | br

function isVal(node: node): node is val {
    return node.type === ''
        || node.type === '$$'
        || node.type === '$'
}

function isLink(node: node): node is link {
    return node.type === 'a' || node.type === 'img'
}

export type vVal<T> = {
    [key in typeVal]: (val: string, parent: T) => void
}

export type vBr<T> = {
    [key in 'br']: (parent: T) => void
}

export type vLink<T> = {
    [key in typeLink]: (title: string, href: string, parent: T) => void
}

export interface vElement<T> {
    element: (type: typeElement, parent: T) => T
}

export interface vDoc<T> {
    doc: () => T
}

export type visitor<T> =
    vDoc<T>
    & vElement<T>
    & vLink<T>
    & vVal<T>
    & vBr<T>


export function visit<T>(ast: element, visitor: visitor<T>) {
    const d = visitor.doc()
    ast.kids.forEach(k => {
        visitNode(k, visitor, d)
    })
    return d
}

export function visitNode<T>(node: node, visitor: visitor<T>, parent: T) {
    if (node.type === 'br') visitor.br(parent)
    else if (isVal(node)) visitor[node.type](node.val, parent)
    else if (isLink(node)) visitor[node.type](node.title, node.href, parent)
    else {
        const p = visitor.element(node.type, parent)
        node.kids.forEach(k => visitNode(k, visitor, p))
    }
}

export function texdown(markDown: string) {
    const doc: node = { type: 'div', kids: [] }
    const ps: element[] = [doc]
    const top = () => ps[ps.length - 1] || doc

    // SPECIAL CHARS \\ * _ $ \n
    const lexer = moo.compile({
        h6: /^###### /
        , h5: /^##### /
        , h4: /^#### /
        , h3: /^### /
        , h2: /^## /
        , h1: /^# /
        , uli: /^\- /
        , oli: /^\d+\. /
        , b: '*'
        , i: '/'
        , u: '_'
        , a: /\[[^\]\n]*\]\([^)\n]*\)/
        , img: /!\[[^\]\n]*\]\([^)\n]*\)/
        , $$: /^\$\$$(?:\\\$|[^$])+^\$\$\n/
        , $: /\$(?:\\\$|[^\n$])+\$/
        , esc: /\\\*|\\_|\\\$|\\\\|^\\#/
        , txt: /[^/!\n*_$\\]+|[!*_$\\/]/
        , blank: { match: /^\n/, lineBreaks: true }
        , eol: { match: /\n/, lineBreaks: true }
    })

    lexer.reset(markDown)

    while (true) {
        const token = lexer.next()
        if (!token) break

        const startParagraphOrLineIfNeeded = () => {
            if (ps.length === 1) {
                const p: element = { type: 'p', kids: [] }
                doc.kids.push(p)
                ps.push(p)
            }
            if (top().type === 'p') {
                const line: element = { type: 'div', kids: [] }
                top().kids.push(line)
                ps.push(line)
            }
        }

        const delimiter = () => {
            const type = token.type as typeElement
            if (top().type === type) {
                ps.pop()
                return
            }
            startParagraphOrLineIfNeeded()
            const c = { type: type, kids: [] }
            top().kids.push(c)
            ps.push(c)
        }

        const text = (str: string) => {
            startParagraphOrLineIfNeeded()
            top().kids.push({ type: '', val: str })
        }

        const list = (type: 'ul' | 'ol') => {
            if (top().type !== type) {
                resetNodes()
                const l = { type: type, kids: [] }
                doc.kids.push(l)
                ps.push(l)
            }
            const li: node = { type: 'li', kids: [] }
            top().kids.push(li)
            ps.push(li)
        }

        const resetNodes = () => ps.splice(1, ps.length - 1)

        const node = () => {
            const c: node = { type: token.type as typeElement, kids: [] }
            doc.kids.push(c)
            resetNodes()
            ps.push(c)
        }

        const extractLink = /.?\[([^\]]*)\]\(([^)]*)\)/

        const link = (type: 'a' | 'img') => {
            startParagraphOrLineIfNeeded()
            const res = extractLink.exec(token.text)
            if (res === null) throw 'expecting link'
            top().kids.push({
                type: type
                , title: res[1]
                , href: res[2]
            })
        }

        const actions: { [type: string]: () => void } = {
            h1: node
            , h2: node
            , h3: node
            , h4: node
            , h5: node
            , h6: node
            , uli: () => list('ul')
            , oli: () => list('ol')
            , b: delimiter
            , i: delimiter
            , u: delimiter
            , $$: () => {
                const tex = token.text.substring(2, token.text.length - 3)
                top().kids.push({
                    type: '$$'
                    , val: tex
                })
            }
            , $: () => {
                startParagraphOrLineIfNeeded()
                const tex = token.text.substring(1, token.text.length - 1)
                top().kids.push({
                    type: '$'
                    , val: tex
                })
            }
            , a: () => link('a')
            , img: () => link('img')
            , txt: () => text(token.text)
            , esc: () => text(token.text.substr(1))
            , blank: () => {
                resetNodes()
                doc.kids.push({ type: 'br' })
            }
            , eol: () => {
                ps.pop()
            }
        }

        if (token.type) actions[token.type]()
    }

    // console.log(JSON.stringify(doc, null, 2))
    return doc
}