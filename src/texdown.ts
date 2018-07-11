import * as moo from 'moo';

export type H = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type Format = | 'b' | 'i' | 'u'
export type ElementType =
    H | Format
    | 'p'
    | 'ul' | 'ol'
    | 'li'

export type Element = {
    type: ElementType
    , token: string
    , data?: any
}

export type Env = 'center'
export type Cmd = 'vspace'

export type TokenType =
    H | Format
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
    startEnv: (type: Env) => void
    endEnv: (type: Env) => void
    cmd: (name: Cmd, arg: string) => void
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
    let currentToken: moo.Token
    const lexer = moo.compile(tokens)

    lexer.reset(markDown)

    const elements: Element[] = []
    const envs: { [env in Env]: boolean } = {
        center: false
    }

    let id = 0
    const topElement = () => elements[elements.length - 1]

    const popElement = () => {
        const el = elements.pop() as Element
        renderers.forEach(r =>
            r.endElement(el)
        )
    }

    const endEnv = (env: Env) => {
        envs[env] = false
        renderers.forEach(r =>
            r.endEnv(env)
        )
    }

    const clearElements = () => {
        while (elements.length) popElement()
    }

    const clearEnvs = () => {
        renderers.forEach(r => {
            if (envs.center) r.endEnv('center')
        })
    }

    const pushElement = (el: Element) => {
        elements.push(el)

        renderers.forEach(r =>
            r.startElement(el, id)
        )

        return el
    }

    const startEnv = (env: Env) => {
        envs[env] = true
        renderers.forEach(r =>
            r.startEnv(env)
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
        if (elements.length && topElement().type === type) {
            popElement()
            return
        }
        if (!elements.length)
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

        while (elements.length && !matchingList()) {
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
    const extractCmd = (cmd: string): [Cmd, string] => {
        const res = reCmd.exec(cmd) as RegExpExecArray
        return [res[1] as Cmd, res[2]]
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
            if (!elements.length) pushElement({
                type: 'p'
                , token: ''
            })
            const [title, href] = extractLink(currentToken.text)
            renderers.forEach(r =>
                r.a(title, href, id)
            )
        }
        , img: () => {
            if (!elements.length) pushElement({
                type: 'p'
                , token: ''
            })
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
            if (!elements.length) pushElement({
                type: 'p'
                , token: ''
            })
            const txt = currentToken.text
            const tex = txt.substring(1, txt.length - 1)
            renderers.forEach(
                r => r.$(tex, id)
            )
        }
        // ENV + CMD
        , env: () => {
            const env = currentToken.text.substr(1) as Env
            clearElements()
            if (envs[env]) endEnv(env)
            else startEnv(env)
        }
        , cmd: () => {
            const [name, arg] = extractCmd(currentToken.text)
            renderers.forEach(r => {
                r.cmd(name, arg)
            })
        }
        // TIKZ
        , tikz: () => {
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
            if (!elements.length) pushElement({
                type: 'p'
                , token: ''
            })
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
            while (
                elements.length
                && topElement().type !== 'p'
                && topElement().type !== 'li') popElement()
            renderers.forEach(
                r => r.eol()
            )
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