import * as moo from 'moo'

type type =
    'doc'
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | '$$' | 'p'
    | 'ul' | 'ol' | 'li'
    | 'b' | 'i' | '$' | 'a'
    | 'br'

interface kid { }

interface node extends kid {
    type: type
    kids: kid[]
}

interface leaf extends kid {
    val: string
}

interface br extends kid {
    type: 'br'
}

interface a extends kid {
    type: 'a'
    title: string
    href: string
}

interface $ extends kid {
    type: '$'
    val: string
}

export function texdown(markDown: string) {
    const doc: node = { type: 'doc', kids: [] }
    const nodes: node[] = [doc]
    const top = () => nodes[nodes.length - 1]

    // SPECIAL CHARS \\ * _ $ \n
    const lexer = moo.compile({
        h6: /^###### /
        , h5: /^##### /
        , h4: /^#### /
        , h3: /^### /
        , h2: /^## /
        , h1: /^# /
        , $$: /^\$\$/
        , uli: /^\- /
        , oli: /^\d+\. /
        , b: '*'
        , i: '_'
        , $: /\$(?:\\\$|[^\n$])+\$/
        , a: /\[[^\]\n]*\]\([^)\n]*\)/
        , img: /!\[[^\]\n]*\]\([^)\n]*\)/
        , txt: /[^!\n*_$\\]+|[!*_$]/
        , esc: /\\\*|\\_|\\\$|\\\\|^\\#/
        , blank: { match: /^\n/, lineBreaks: true }
        , eol: { match: /\n/, lineBreaks: true }
    })

    lexer.reset(markDown)

    while (true) {
        const token = lexer.next()
        if (!token) break

        const delimiter = () => {
            const type = token.type as type
            if (top().type === type) return nodes.pop()
            const c: node = { type: type, kids: [] }
            top().kids.push(c)
            nodes.push(c)
        }

        const ensureInNode = () => {
            if (top().type !== 'doc') return
            const p: node = { type: 'p', kids: [] }
            doc.kids.push(p)
            nodes.push(p)
        }

        const text = (str: string) => {
            ensureInNode()
            top().kids.push({ val: str })
        }

        const list = (type: 'ul' | 'ol') => {
            if (top().type !== type) {
                resetNodes()
                const l = { type: type, kids: [] }
                doc.kids.push(l)
                nodes.push(l)
            }
            const li: node = { type: 'li', kids: [] }
            top().kids.push(li)
            nodes.push(li)
            console.log('list', top())
        }

        const resetNodes = () => nodes.splice(1, nodes.length - 1)

        const node = () => {
            const c: node = { type: token.type as type, kids: [] }
            doc.kids.push(c)
            resetNodes()
            nodes.push(c)
        }

        const extractLink = /.?\[([^\]]*)\]\(([^)]*)\)/
        const link = (type: 'a' | 'img') => {
            ensureInNode()
            const res = extractLink.exec(token.text)
            if (res === null) throw 'expecting link'
            top().kids.push({
                type: type
                , title: res[1]
                , src: res[2]
            })
        }

        const actions: { [type: string]: () => void } = {
            h1: node
            , h2: node
            , h3: node
            , h4: node
            , h5: node
            , h6: node
            , $$: node
            , uli: () => list('ul')
            , oli: () => list('ol')
            , b: delimiter
            , i: delimiter
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
                const br = { type: 'br' }
                const type = top().type
                if (type === 'p') return top().kids.push(br)
                if (type === 'li') return nodes.pop()
                resetNodes()
                doc.kids.push(br)
            }
        }

        // console.log('[TOKEN]', token)
        if (token.type) actions[token.type]()
    }

    console.log('doc', JSON.stringify(doc, null, 2))
    return doc
}