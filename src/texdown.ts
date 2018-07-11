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
    , attr: { [key: string]: any }
}

export type Env = 'center'
export type Cmd = 'vspace'

export type Token =
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
    [key in Token]: (tkn: moo.Token) => void
}

const tokens: { [key in Token]: any } = {
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
    , uli: /^[ \t]*\- /
    , oli: /^[ \t]*\d+\. /
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
            r.endElement(el.type)
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

    const pushElementType = (type: ElementType) => {
        elements.push({
            type: type
            , attr: {}
        })

        renderers.forEach(r =>
            r.startElement(type, id)
        )
    }

    const pushElement = (el: Element) => {
        elements.push(el)

        renderers.forEach(r =>
            r.startElement(el.type, id)
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
        pushElementType(type)
    }

    const format = (type: ElementType) => {
        if (elements.length && topElement().type === type) {
            popElement()
            return
        }
        if (!elements.length) pushElementType('p')
        pushElementType(type)
    }

    const li = (type: 'ul' | 'ol', nesting: string) => {
        const matchingList = () => {
            const te = topElement()
            return te
                && ['ul', 'ol'].includes(te.type)
                && te.attr.nesting.length <= nesting.length
        }

        while (elements.length && !matchingList()) {
            popElement()
        }


        const te = topElement()
        if (!te
            || te.type !== type
            || te.attr.nesting !== nesting) {
            pushElement({
                type: type
                , attr: {
                    nesting: nesting
                }
            })
        }

        pushElementType('li')
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
        , uli: (token) => li('ul', token.text)
        , oli: (token) => li('ol', token.text.replace(/\d+/, ''))
        // LINK
        , a: (token) => {
            if (!elements.length) pushElementType('p')
            const [title, href] = extractLink(token.text)
            renderers.forEach(r =>
                r.a(title, href, id)
            )
        }
        , img: (token) => {
            if (!elements.length) pushElementType('p')
            const [title, href] = extractLink(token.text)
            renderers.forEach(r =>
                r.img(title, href, id)
            )
        }
        // MATH
        , $$: (token) => {
            clearElements()
            const txt = token.text
            const tex = txt.substring(2, txt.length - 2)
            renderers.forEach(
                r => r.$$(tex, id)
            )
        }
        , $: (token) => {
            if (!elements.length) pushElementType('p')
            const txt = token.text
            const tex = txt.substring(1, txt.length - 1)
            renderers.forEach(
                r => r.$(tex, id)
            )
        }
        // ENV + CMD
        , env: (token) => {
            const env = token.text.substr(1) as Env
            clearElements()
            if (envs[env]) endEnv(env)
            else startEnv(env)
        }
        , cmd: (token) => {
            const [name, arg] = extractCmd(token.text)
            renderers.forEach(r => {
                r.cmd(name, arg)
            })
        }
        // TIKZ
        , tikz: (token) => {
            renderers.forEach(r =>
                r.tikz(token.text, id)
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
        , esc: (token) => {
            renderers.forEach(r =>
                r.esc(token.text)
            )
        }
        // VAL
        , txt: (token) => {
            if (!elements.length) pushElementType('p')
            renderers.forEach(r =>
                r.txt(token.text)
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
        const token = lexer.next()
        if (token === undefined) break
        actions[token.type as Token](token)
    }

    clearElements()
    clearEnvs()
    renderers.forEach(r => r.done())
}               