import * as moo from 'moo'

export function marko(markDown: string) {
    type block = 'h1' | 'p'
    type inline = 'b'
    type node = {
        type: 'doc' | 'txt' | block | inline
        data?: {}
        kids?: node[]
        text?: string
    }

    const lexer = moo.compile({
        h1: /^#/
        , b: '**'
        , txt: /[^\n*]+/
        , NL: { match: /\n/, lineBreaks: true }
    })

    lexer.reset(markDown)


    const top = () => stack[stack.length - 1]
    const kids = (node: node): node[] => {
        if (!node.kids) throw 'expecting kids'
        return node.kids
    }

    const doc: node = { type: 'doc', kids: [] }
    const stack: node[] = [doc]
    while (true) {
        const token = lexer.next()
        if (!token) break

        // TODO check if placing actions outside the loop improves speed
        const actions: { [type: string]: () => void } = {
            h1: () => {
                const h1: node = { type: 'h1', kids: [] }
                kids(top()).push(h1)
                stack.push(h1)
            }
            , b: () => {
                if (top().type === 'b') return stack.pop()

                const b: node = { type: 'b', kids: [] }
                kids(top()).push(b)
                stack.push(b)
            }
            , txt: () => {
                console.log('[txt]')
                if (top().type === 'doc') {
                    const p: node = { type: 'p', kids: [] }
                    kids(doc).push(p)
                    stack.push(p)
                }
                kids(top()).push({ type: 'txt', text: token.text })
            }
        }

        // console.log(token)
        if (token.type) actions[token.type]()
    }

    // console.log('stack', JSON.stringify(stack, null, 2))
    return doc
}