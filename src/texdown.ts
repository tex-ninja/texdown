import * as moo from 'moo';

export type H = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type Format = | 'b' | 'i' | 'u'
export type Element =
    H | Format
    | 'p'
    | 'ul' | 'ol'
    | 'li'

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
    , uli: /^\- /
    , oli: /^\d+\. /
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
    startElement: (type: Element, id: number) => void
    endElement: (type: Element) => void
    startEnv: (type: Env) => void
    endEnv: (type: Env) => void
    cmd: (name: Cmd, arg: string) => void
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

    const pushElement = (type: Element) => {
        elements.push(type)

        renderers.forEach(r =>
            r.startElement(type, id)
        )
    }

    const startEnv = (env: Env) => {
        envs[env] = true
        renderers.forEach(r =>
            r.startEnv(env)
        )
    }

    const h = (type: H) => {
        clearElements()
        pushElement(type)
    }

    const format = (type: Element) => {
        if (topElement() === type) {
            popElement()
            return
        }
        if (!elements.length) pushElement('p')
        pushElement(type)
    }

    const list = (type: 'ul' | 'ol') => {
        while (elements.length && topElement() !== type) popElement()
        if (topElement() !== type) pushElement(type)
        pushElement('li')
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
        , uli: () => list('ul')
        , oli: () => list('ol')
        // LINK
        , a: (token) => {
            if (!elements.length) pushElement('p')
            const [title, href] = extractLink(token.text)
            renderers.forEach(r =>
                r.a(title, href, id)
            )
        }
        , img: (token) => {
            if (!elements.length) pushElement('p')
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
            if (!elements.length) pushElement('p')
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
                r.txt(token.text[0])
            )
        }
        // VAL
        , txt: (token) => {
            if (!elements.length) pushElement('p')
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
                && topElement() !== 'p'
                && topElement() !== 'li') popElement()
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