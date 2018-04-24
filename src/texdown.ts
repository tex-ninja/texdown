import * as moo from 'moo'

type type =
    'doc'
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'p'
    | 'ul' | 'ol' | 'li'
    | 'b' | 'i'


interface parent {
    type: type
    kids: node[]
}

interface br {
    type: 'br'
}

interface val {
    type: '' | '$$' | '$'
    val: string
}

interface link {
    type: 'a' | 'img'
    title: string
    href: string
}

type node = parent | val | link | br

function isVal(node: node): node is val {
    return node.type === ''
        || node.type === '$$'
        || node.type === '$'
}

function isLink(node: node): node is link {
    return node.type === 'a' || node.type === 'img'
}

export interface visitor {
    txt: (val: string, parent: any) => any
}

export function visit(ast: node, visitor: visitor, parent?: node) {
    // if (isLeaf(ast)) return visitor.txt(ast.val, parent)

}

export function texdown(markDown: string) {
    const doc: parent = { type: 'doc', kids: [] }
    const ps: parent[] = [doc]
    const top = () => ps[ps.length - 1]

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
        , i: '_'
        , a: /\[[^\]\n]*\]\([^)\n]*\)/
        , img: /!\[[^\]\n]*\]\([^)\n]*\)/
        , $$: /\$\$(?:\\\$|[^$])+\$\$/
        , $: /\$(?:\\\$|[^\n$])+\$/
        , esc: /\\\*|\\_|\\\$|\\\\|^\\#/
        , txt: /[^!\n*_$\\]+|[!*_$\\]/
        , blank: { match: /^\n/, lineBreaks: true }
        , eol: { match: /\n/, lineBreaks: true }
    })

    lexer.reset(markDown)

    while (true) {
        const token = lexer.next()
        if (!token) break

        const delimiter = () => {
            const type = token.type as type
            if (top().type === type) return ps.pop()
            const c = { type: type, kids: [] }
            top().kids.push(c)
            ps.push(c)
        }

        const ensureInNode = () => {
            if (top().type !== 'doc') return
            const p: parent = { type: 'p', kids: [] }
            doc.kids.push(p)
            ps.push(p)
        }

        const text = (str: string) => {
            ensureInNode()
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
            const c: node = { type: token.type as type, kids: [] }
            doc.kids.push(c)
            resetNodes()
            ps.push(c)
        }

        const extractLink = /.?\[([^\]]*)\]\(([^)]*)\)/

        const link = (type: 'a' | 'img') => {
            ensureInNode()
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
            , $$: () => {
                const tex = token.text.substring(2, token.text.length - 2)
                top().kids.push({
                    type: '$$'
                    , val: tex
                })
            }
            , $: () => {
                ensureInNode()
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
                const br: br = { type: 'br' }
                const type = top().type
                if (type === 'p') return top().kids.push(br)
                if (type === 'li') return ps.pop()
                resetNodes()
                doc.kids.push(br)
            }
        }

        if (token.type) actions[token.type]()
    }

    return doc
}