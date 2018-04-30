import * as moo from 'moo'

export type h = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type tokens =
    h
    | 'b' | 'i' | 'u'
    | 'uli' | 'oli'
    | 'a' | 'img'
    | '$' | '$$'
    | 'tikz'
    | 'esc'
    | 'txt'
    | 'blank' | 'eol' | 'hr'

export type typeElement =
    h
    | 'b' | 'i' | 'u'
    | 'p'
    | 'ul' | 'ol'
    | 'li'
    | 'hr'


export type action = {
    [key in tokens]: (tkn: moo.Token) => void
}

export interface Renderer {
    startElement: (type: typeElement, id: number) => void
    endElement: (type: typeElement) => void
    txt: (val: string) => void
    eol: () => void
    blank: () => void
    a: (title: string, href: string, id: number) => void
    img: (title: string, src: string, id: number) => void
    $: (tex: string, id: number) => void
    $$: (tex: string, id: number) => void
    tikz: (tikz: string, id: number) => void
}

export function texDown(markDown: string, ...renderers: Renderer[]) {
    const lexer = moo.compile({
        h6: /^###### /
        , h5: /^##### /
        , h4: /^#### /
        , h3: /^### /
        , h2: /^## /
        , h1: /^# /
        , b: '*'
        , i: '/'
        , u: '_'
        , uli: /^\- /
        , oli: /^\d+\. /
        , a: /\[[^\]\n]*\]\([^)\n]*\)/
        , img: /!\[[^\]\n]*\]\([^)\n]*\)/
        , $$: /^\$\$$(?:\\\$|[^$])+^\$\$\n/
        , $: /\$(?:\\\$|[^\n$])+\$/
        , tikz: /\\begin\{tikzpicture\}[^]*?\\end\{tikzpicture\}/
        , hr: /^--$/
        , esc: /\*\*|\/\/|__/
        , txt: /[^/!\n*_$\\]+|[!*_$\\/]/
        , blank: { match: /^\n/, lineBreaks: true }
        , eol: { match: /\n/, lineBreaks: true }
    })

    lexer.reset(markDown)

    const stack: typeElement[] = []
    let id = 0
    const top = () => stack[stack.length - 1]

    const pop = () => {
        const el = stack.pop() as typeElement
        renderers.forEach(
            p => p.endElement(el)
        )
    }

    const clearStack = () => {
        while (stack.length) pop()
    }

    const push = (type: typeElement) => {
        stack.push(type)
        id++
        renderers.forEach(
            p => p.startElement(type, id)
        )
    }

    const h = (type: h) => {
        clearStack()
        push(type)
    }

    const del = (type: typeElement) => {
        if (top() === type) {
            pop()
            return
        }
        if (!stack.length) push('p')
        push(type)
    }

    const list = (type: 'ul' | 'ol') => {
        while (stack.length && top() !== type) pop()
        if (top() !== type) push(type)
        push('li')
    }

    const reLink = /!?\[([^\]]*)\]\(([^)]*)\)/
    const extracLink = (link: string) => {
        const res = reLink.exec(link) as RegExpExecArray
        return [res[1], res[2]]
    }

    const actions: action = {
        // ELEMENT
        h6: () => h('h6')
        , h5: () => h('h5')
        , h4: () => h('h4')
        , h3: () => h('h3')
        , h2: () => h('h2')
        , h1: () => h('h1')
        , b: () => del('b')
        , i: () => del('i')
        , u: () => del('u')
        , uli: () => list('ul')
        , oli: () => list('ol')
        // LINK
        , a: (token) => {
            if (!stack.length) push('p')
            const [title, href] = extracLink(token.text)
            id++
            renderers.forEach(
                p => p.a(title, href, id)
            )
        }
        , img: (token) => {
            if (!stack.length) push('p')
            const [title, href] = extracLink(token.text)
            id++
            renderers.forEach(
                p => p.img(title, href, id)
            )
        }
        // MATH
        , $$: (token) => {
            const txt = token.text
            const tex = txt.substring(3, txt.length - 4)
            id++
            renderers.forEach(
                p => p.$$(tex, id)
            )
        }
        , $: (token) => {
            if (!stack.length) push('p')
            const txt = token.text
            const tex = txt.substring(1, txt.length - 1)
            id++
            renderers.forEach(
                p => p.$(tex, id)
            )
        }
        // TIKZ
        , tikz: (token) => {
            id++
            renderers.forEach(
                p => p.tikz(token.text, id)
            )
        }
        // HR
        , hr: () => {
            id++
            clearStack()
            renderers.forEach(
                p => {
                    p.startElement('hr', id)
                    p.endElement('hr')
                }
            )
        }
        // ESC
        , esc: () => { }
        // VAL
        , txt: (token) => {
            if (!stack.length) push('p')
            renderers.forEach(
                p => p.txt(token.text)
            )
        }
        // EOL
        , blank: () => {
            clearStack()
            renderers.forEach(
                p => p.blank()
            )
        }
        , eol: () => {
            while (
                stack.length
                && top() !== 'p'
                && top() !== 'li') pop()
            renderers.forEach(
                p => p.eol()
            )
        }
    }

    while (true) {
        const token = lexer.next()
        if (token === undefined) break
        actions[token.type as tokens](token)
    }

    clearStack()
}               