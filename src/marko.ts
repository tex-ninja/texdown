import * as moo from 'moo'

export function marko(markDown: string) {
    type node = {
        type: 'doc' | 'h1' | 'b' | 'txt'
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

    const next = (parent: node) => {
        const push = (kid: node): node => {
            if (!parent.kids) throw 'expecting kids'
            parent.kids.push(kid)
            return kid
        }

        const token = lexer.next()
        if (!token) return

        const actions: { [type: string]: () => void } = {
            h1: () => {
                next(push({ type: 'h1', kids: [] }))
            }
            , b: () => {
                next(push({ type: 'b', kids: [] }))
            }
            , txt: () => {
                push({ type: 'txt', text: token.text })
                next(parent)
            }
        }

        console.log(token)
        if (token.type) actions[token.type]()
    }

    const doc: node = { type: 'doc', kids: [] }
    next(doc)
    return doc
}