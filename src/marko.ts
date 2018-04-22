import * as moo from 'moo'

type type =
    'doc'
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | '$$'
    | 'ul' | 'ol' | 'li'
    | 'p'
    | 'b' | 'i' | '$'
    | ''

interface nodeOrLeaf { }

interface node extends nodeOrLeaf {
    type: type
    val: nodeOrLeaf[]
}

interface leaf extends nodeOrLeaf {
    val: string
}

export function marko(markDown: string) {
    const doc: node = { type: 'doc', val: [] }
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
        , $: '$'
        , i: '_'
        , esc: /\\\*|\\_|\\\$|\\\\|^\\#/
        , txt: /[^\n*_$\\]+/
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
            const c: node = { type: type, val: [] }
            top().val.push(c)
            nodes.push(c)
        }

        const text = (str: string) => {
            if (top().type === 'doc') {
                const p: node = { type: 'p', val: [] }
                doc.val.push(p)
                nodes.push(p)
            }
            top().val.push({ val: str })
        }

        const list = (type: 'ul' | 'ol') => {
            if (top().type !== type) {
                resetNodes()
                const l = { type: type, val: [] }
                doc.val.push(l)
                nodes.push(l)
            }
            const li: node = { type: 'li', val: [] }
            top().val.push(li)
            nodes.push(li)
            console.log('list', top())
        }

        const resetNodes = () => nodes.splice(1, nodes.length - 1)

        const node = () => {
            const c: node = { type: token.type as type, val: [] }
            doc.val.push(c)
            resetNodes()
            nodes.push(c)
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