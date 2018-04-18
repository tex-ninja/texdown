import * as moo from 'moo'

export function marko(markDown: string) {
    type node = {
        type: 'doc' | 'h1' | 'b'
        data?: {}
        kids?: node[]
        text?: string
    }

    const lexer = moo.compile({
        h1: /^#/
        , b: '**'
    })

    lexer.reset(markDown)

    const next = (parent: node) => {
        const push = (kid: node): node => {
            if (!parent.kids) throw 'expecting kids'
            parent.kids.push(kid)
            return kid
        }

        const actions: { [type: string]: () => void } = {
            h1: () => {
                next(push({ type: 'h1', kids: [] }))
            }
            , b: () => { }
        }

        const token = lexer.next()
        if (!token) return
        console.log(token)
        if (token.type) actions[token.type]()
    }

    const doc: node = { type: 'doc', kids: [] }
    next(doc)
    return doc
}