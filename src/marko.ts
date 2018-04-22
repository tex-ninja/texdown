import * as moo from 'moo'

type type = 'doc' | 'txt' | 'h1' | 'p' | 'b' | '$'

interface node {
    type: type
    val: node[] | string
}

interface container extends node {
    val: node[]
}

interface leaf extends node {
    val: string
}

export function marko(markDown: string) {
    const doc: container = { type: 'doc', val: [] }
    const containers: container[] = [doc]
    const top = () => containers[containers.length - 1]

    // SPECIAL CHARS \\ * _ $ \n
    const lexer = moo.compile({
        h1: /^#/
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
        console.log(token.type)

        const delimiter = () => {
            const type = token.type as type
            const topType = top().type
            if (topType === type) return containers.pop()
            if (topType === '$') return text(token.text)
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
            top().val.push({ type: 'txt', val: str })
        }
        // TODO check if placing actions outside the loop improves speed
        const actions: { [type: string]: () => void } = {
            h1: () => {
                const h1: container = { type: 'h1', val: [] }
                doc.val.push(h1)
                containers.splice(1, containers.length - 1)
                containers.push(h1)
            }
            , txt: () => text(token.text)
            , esc: () => text(token.text.substr(1))
            , b: delimiter
            , $: delimiter
            , i: delimiter
        }

        if (token.type) actions[token.type]()
    }

    console.log('doc', JSON.stringify(doc, null, 2))
    return doc
}