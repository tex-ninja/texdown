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
    })

    lexer.reset(markDown)

    // TODO check if Set improves speed
    const block = ['h1', 'p']

    const top = () => stack[stack.length - 1]
    const isBlock = (node: node) => block.indexOf(node.type) > -1
    const kids = (node: node): node[] => {
        if (!node.kids) throw 'expecting kids'
        return node.kids
    }

    const doc: node = { type: 'doc', kids: [] }
    const stack: node[] = [doc]
    while (true) {
        const token = lexer.next()
        if (!token) break

        const actions: { [type: string]: () => void } = {
            h1: () => {
                const h1: node = { type: 'h1', kids: [] }
                kids(top()).push(h1)
                stack.push(h1)
            }
            , b: () => {
                kids(top()).push({ type: 'b', kids: [] })
            }
            , txt: () => {
                if (!isBlock(top())) stack.push({ type: 'p', kids: [] })
                kids(top()).push({ type: 'txt', text: token.text })
            }
        }

        console.log(token)
        if (token.type) actions[token.type]()
    }

    return doc
}