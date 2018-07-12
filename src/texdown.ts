import * as moo from 'moo';

export type H = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type ElementTypeBlock = H | 'p' | 'ul' | 'ol' | 'li'
export type ElementTypeInline = 'b' | 'i' | 'u'
export type ElementType = ElementTypeBlock | ElementTypeInline

export type Element = {
    type: ElementType
    , token: string
    , data?: any
}

export type TokenType =
    H | ElementTypeInline
    | 'uli' | 'oli'
    | 'a' | 'img'
    | '$' | '$$'
    | 'env' | 'cmd'
    | 'tikz'
    | 'esc'
    | 'txt'
    | 'blank' | 'eol' | 'hr'

export type action = {
    [key in TokenType]: () => void
}

const tokens: { [key in TokenType]: any } = {
    h6: /^###### /
    , h5: /^##### /
    , h4: /^#### /
    , h3: /^### /
    , h2: /^## /
    , h1: /^# /
    , esc: /\*\*|\/\/|__/
    , b: '*'
    , i: '/'
    , u: '_'
    , uli: /^[ ]*\- /
    , oli: /^[ ]*\d+\. /
    , a: /\[[^\]\n]*\]\([^)\n]*\)/
    , img: /!\[[^\]\n]*\]\([^)\n]*\)/
    , $$: /^\$\$$(?:\\\$|[^$])+^\$\$$/
    , $: /\$(?:\\\$|[^\n$])+\$/
    , tikz: /^\\begin\{tikzpicture\}[^]*?^\\end\{tikzpicture\}/
    , cmd: /^\\\w+\{[^}]*\}$/
    , env: /^\\\w+$/
    , hr: /^--$/
    , txt: /[^/!\n*_$\\\[\]]+|[!*_$\\/\[\]]/
    , blank: { match: /^\n/, lineBreaks: true }
    , eol: { match: /\n/, lineBreaks: true }
}

export interface Renderer {
    startElement: (el: Element, id: number) => void
    endElement: (el: Element) => void
    startEnv: (name: string) => void
    endEnv: (name: string) => void
    cmd: (name: string, arg: string) => void
    esc: (val: string) => void
    txt: (val: string) => void
    hr: () => void
    eol: () => void
    blank: () => void
    a: (title: string, href: string, id: number) => void
    img: (title: string, src: string, id: number) => void
    $: (tex: string, id: number) => void
    $$: (tex: string, id: number) => void
    tikz: (tikz: string, id: number) => void
    done: () => void
}

export function texDown(markDown: string, ...renderers: Renderer[]) {
    const lexer = moo.compile(tokens)
    lexer.reset(markDown)

    let id = 0
    let currentToken: moo.Token

    const stack: Element[] = []
    const env: { [env: string]: boolean } = {}

    const topElement = () => stack[stack.length - 1]

    const popElement = () => {
        const el = stack.pop() as Element
        renderers.forEach(r =>
            r.endElement(el)
        )
    }

    const endEnv = (name: string) => {
        env[name] = false
        renderers.forEach(r =>
            r.endEnv(name)
        )
    }

    const clearElements = () => {
        while (stack.length) popElement()
    }

    const clearEnvs = () => {
        renderers.forEach(r => {
            Object.entries(env).forEach(([name, b]) => {
                if (b) r.endEnv(name)
            })
        })
    }

    const pushElement = (el: Element) => {
        stack.push(el)

        renderers.forEach(r =>
            r.startElement(el, id)
        )

        return el
    }

    const startEnv = (e: string) => {
        env[e] = true
        renderers.forEach(r =>
            r.startEnv(e)
        )
    }

    const h = (type: H) => {
        clearElements()
        pushElement({
            type: type
            , token: currentToken.text
        })
    }

    const format = (type: ElementType) => {
        if (stack.length && topElement().type === type) {
            popElement()
            return
        }
        if (!stack.length)
            pushElement({
                type: 'p'
                , token: ''
            })

        pushElement({
            type: type
            , token: currentToken.text
        })
    }

    const li = (type: 'ul' | 'ol') => {
        const nestLevel = currentToken.text.replace(/\d+/, '').length

        const matchingList = () => {
            const te = topElement()
            return te
                && ['ul', 'ol'].includes(te.type)
                && te.data <= nestLevel
        }

        while (stack.length && !matchingList()) {
            popElement()
        }

        const te = topElement()

        if (!te || te.type !== type || te.data < nestLevel) {
            pushElement({
                type: type
                , token: ''
                , data: nestLevel
            })
        }

        pushElement({
            type: 'li'
            , token: currentToken.text
        })
    }

    const reLink = /!?\[([^\]]*)\]\(([^)]*)\)/
    const extractLink = (link: string) => {
        const res = reLink.exec(link) as RegExpExecArray
        return [res[1], res[2]]
    }

    const reCmd = /\\(\w+)\{([^}]*)\}/
    const extractCmd = (cmd: string): [string, string] => {
        const res = reCmd.exec(cmd) as RegExpExecArray
        return [res[1], res[2]]
    }

    const pushParIfEmpty = () => {
        if (!stack.length) pushElement({
            type: 'p'
            , token: ''
        })
    }

    const actions: action = {
        // ELEMENT
        h6: () => h('h6')
        , h5: () => h('h5')
        , h4: () => h('h4')
        , h3: () => h('h3')
        , h2: () => h('h2')
        , h1: () => h('h1')
        , b: () => format('b')
        , i: () => format('i')
        , u: () => format('u')
        , uli: () => li('ul')
        , oli: () => li('ol')
        // LINK
        , a: () => {
            pushParIfEmpty()
            const [title, href] = extractLink(currentToken.text)
            renderers.forEach(r =>
                r.a(title, href, id)
            )
        }
        , img: () => {
            pushParIfEmpty()
            const [title, href] = extractLink(currentToken.text)
            renderers.forEach(r =>
                r.img(title, href, id)
            )
        }
        // MATH
        , $$: () => {
            clearElements()
            const txt = currentToken.text
            const tex = txt.substring(2, txt.length - 2)
            renderers.forEach(
                r => r.$$(tex, id)
            )
        }
        , $: () => {
            pushParIfEmpty()
            const txt = currentToken.text
            const tex = txt.substring(1, txt.length - 1)
            renderers.forEach(
                r => r.$(tex, id)
            )
        }
        // ENV + CMD
        , env: () => {
            clearElements()
            const e = currentToken.text.substr(1)
            if (env[e]) endEnv(e)
            else startEnv(e)
        }
        , cmd: () => {
            clearElements()
            const [name, arg] = extractCmd(currentToken.text)
            renderers.forEach(r => {
                r.cmd(name, arg)
            })
        }
        // TIKZ
        , tikz: () => {
            clearElements()
            renderers.forEach(r =>
                r.tikz(currentToken.text, id)
            )
        }
        // HR
        , hr: () => {
            clearElements()
            renderers.forEach(r =>
                r.hr()
            )
        }
        // ESC
        , esc: () => {
            renderers.forEach(r =>
                r.esc(currentToken.text)
            )
        }
        // VAL
        , txt: () => {
            pushParIfEmpty()
            renderers.forEach(r =>
                r.txt(currentToken.text)
            )
        }
        // EOL
        , blank: () => {
            clearElements()
            renderers.forEach(r =>
                r.blank()
            )
        }

        , eol: () => {
            const multiline = ['p', 'li']

            const te = topElement()
            if (te && multiline.includes(te.type)) {
                renderers.forEach(
                    r => r.eol()
                )
            }

            while (
                stack.length
                && !multiline.includes(topElement().type))
                popElement()
        }
    }

    while (true) {
        id++
        currentToken = lexer.next() as moo.Token
        if (currentToken === undefined) break
        actions[currentToken.type as TokenType]()
    }

    clearElements()
    clearEnvs()
    renderers.forEach(r => r.done())
}               