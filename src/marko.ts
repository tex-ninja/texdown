import * as moo from 'moo'

export function marko(markDown: string) {

    type node = {
        type: 'doc' | 'txt' | 'h1' | 'p' | 'b'
        val: node[] | string
    }

    const lexer = moo.compile({
        h1: /^#/
        , b: /\*\*[^*\n]+?\*\*/
        , i: /\*[^*\n]+?\*/
        , a: /\[[^\]]*\]\([^)]*?\)/
        , ui: /^-/
        , oi: /^[\d]+\./
        , txt: /[^\n*]+|\*.*/
        , blank: { match: /^\n/, lineBreaks: true }
        , eol: { match: /\n/, lineBreaks: true }
    })

    lexer.reset(markDown)

    const doc: { type: string, val: node[] } = { type: 'doc', val: [] }
    let currentBlock: node | undefined = undefined

    const push = (node: node) => {
        if (!currentBlock) throw 'error: no currentBlock'
        const kids = currentBlock.val as node[]
        kids.push(node)
    }

    while (true) {
        const token = lexer.next()
        if (!token) break

        // TODO check if placing actions outside the loop improves speed
        const actions: { [type: string]: () => void } = {
            h1: () => {
                const h1: node = { type: 'h1', val: [] }
                doc.val.push(h1)
                currentBlock = h1
            }
            , b: () => {
                if (!currentBlock) {
                    const p: node = { type: 'p', val: [] }
                    doc.val.push(p)
                    currentBlock = p
                }

                push({
                    type: 'b'
                    , val: token.text.substring(2, token.text.length - 2)
                })
            }
            , ui: () => {
            }
            , txt: () => {
                push({ type: 'txt', val: token.text })
            }
        }

        // console.log(token)
        if (token.type) actions[token.type]()
    }

    // console.log('stack', JSON.stringify(stack, null, 2))
    return doc
}