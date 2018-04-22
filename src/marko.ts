import * as moo from 'moo'

type type =
    'doc'
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | '$$' | 'p'
    | 'ul' | 'ol' | 'li'
    | 'b' | 'i' | '$' | 'a'

interface kid { }

interface node extends kid {
    type: type
    kids: kid[]
}

interface leaf extends kid {
    val: string
}

interface a extends kid {
    type: 'a'
    title: string
    src: string
}

export function marko(markDown: string) {
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
        , $: '$'
        , a: /\[[^\]\n]*\]\([^)\n]*\)/
        , img: /!\[[^\]\n]*\]\([^)\n]*\)/
        , esc: /\\\*|\\_|\\\$|\\\\|^\\#|!|\[/
        , txt: /[^!\[\n*_$\\]+/
        , blank: { match: /^\n/, lineBreaks: true }
        , eol: { match: /\n/, lineBreaks: true }
    })

    lexer.reset(markDown)

    while (true) {
        const token = lexer.next()
        if (!token) break

        const delimiter = () => {
            const type = token.type as type
            const topType = top().type
            if (topType === type) return nodes.pop()
            if (topType === '$' || topType === '$$') return text(token.text)
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
            , $: delimiter
            , a: () => link('a')
            , img: () => link('img')
            , txt: () => text(token.text)
            , esc: () => text(token.text.substr(1))
            , blank: resetNodes
            , eol: () => {
                const type = top().type
                if (type === 'p') return
                if (type === 'li') return nodes.pop()
                resetNodes()
            }
        }

        if (token.type) actions[token.type]()
    }

    console.log('doc', JSON.stringify(doc, null, 2))
    return doc
}