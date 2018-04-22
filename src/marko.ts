import * as moo from 'moo'

type type = 'doc' | '' | 'h1' | '$$' | 'p' | 'b' | 'i' | '$'

interface node {
    type: type
    val: node[] | string
}

interface container extends node {
    val: node[]
}

interface leaf extends node {
    type: ''
    val: string
}

export function marko(markDown: string) {
    const doc: container = { type: 'doc', val: [] }
    const containers: container[] = [doc]
    const top = () => containers[containers.length - 1]

    // SPECIAL CHARS \\ * _ $ \n
    const lexer = moo.compile({
        h1: /^#/
        , $$: /^\$\$/
        , b: '*'
        , $: '$'
        , i: '_'
        , esc: /\\\*|\\_|\\\$|\\\\/
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
            if (topType === type) return containers.pop()
            if (topType === '$' || topType === '$$') return text(token.text)
            const c: container = { type: type, val: [] }
            top().val.push(c)
            containers.push(c)
        }

        const text = (str: string) => {
            if (top().type === 'doc') {
                const p: container = { type: 'p', val: [] }
                doc.val.push(p)
                containers.push(p)
            }
            top().val.push({ type: '', val: str })
        }

        const resetContainers = () => containers.splice(1, containers.length - 1)
        const container = () => {
            const c: container = { type: token.type as type, val: [] }
            doc.val.push(c)
            resetContainers()
            containers.push(c)
        }

        const actions: { [type: string]: () => void } = {
            h1: container
            , $$: container
            , txt: () => text(token.text)
            , esc: () => text(token.text.substr(1))
            , b: delimiter
            , $: delimiter
            , i: delimiter
            , blank: resetContainers
            , eol: () => {
                const n = top()
                if (n.type !== 'doc' && n.type !== 'p') resetContainers()
            }
        }

        if (token.type) actions[token.type]()
    }

    console.log('doc', JSON.stringify(doc, null, 2))
    return doc
}