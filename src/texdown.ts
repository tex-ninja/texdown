import * as moo from 'moo'

export type tokens =
    'h6' | 'h5' | 'h4' | 'h3' | 'h2' | 'h1'
    | 'b' | 'i' | 'u'
    | 'uli' | 'oli'
    | 'a' | 'img'
    | '$' | '$$'
    | 'tikz'
    | 'esc'
    | 'txt'
    | 'blank' | 'eol'

export type typeElement =
    'h6' | 'h5' | 'h4' | 'h3' | 'h2' | 'h1'
    | 'b' | 'i' | 'u'
    | 'p'
    | 'ul' | 'ol'
    | 'li'

export type typeVal = 'txt'

export type type =
    typeElement
    | typeVal

export type action = {
    [key in tokens]: (tkn: moo.Token) => void
}

export interface parser {
    startElement: (type: typeElement) => void
    endElement: (type: typeElement) => void
    $$: (tex: string) => void
    $: (tex: string) => void
    a: (title: string, href: string) => void
    img: (title: string, src: string) => void
    txt: (val: string) => void
    tikz: (tikz: string) => void
    eol: () => void
}

export function texDown<T extends parser>(markDown: string, parser: T): T {
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
        , esc: /\\\*|\\_|\\\$|\\\\|^\\#/
        , txt: /[^/!\n*_$\\]+|[!*_$\\/]/
        , blank: { match: /^\n/, lineBreaks: true }
        , eol: { match: /\n/, lineBreaks: true }
    })

    lexer.reset(markDown)

    const stack: typeElement[] = []
    const top = () => stack[stack.length - 1]

    const pop = () => {
        parser.endElement(stack.pop() as typeElement)
    }

    const push = (type: typeElement) => {
        stack.push(type)
        parser.startElement(type)
    }

    const newElement = (type: typeElement) => {
        stack.push(type)
        parser.startElement(type)
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
        console.log('link', link, 'res', res)
        return [res[1], res[2]]
    }

    const actions: action = {
        // ELEMENT
        h6: () => newElement('h6')
        , h5: () => newElement('h5')
        , h4: () => newElement('h4')
        , h3: () => newElement('h3')
        , h2: () => newElement('h2')
        , h1: () => newElement('h1')
        , b: () => del('b')
        , i: () => del('i')
        , u: () => del('u')
        , uli: () => list('ul')
        , oli: () => list('ol')
        // LINK
        , a: (token) => {
            if (!stack.length) push('p')
            const [title, href] = extracLink(token.text)
            parser.a(title, href)
        }
        , img: (token) => {
            const [title, href] = extracLink(token.text)
            parser.img(title, href)
        }
        // MATH
        , $$: (token) => {
            const txt = token.text
            parser.$$(txt.substring(3, txt.length - 4))
        }
        , $: (token) => {
            if (!stack.length) push('p')
            const txt = token.text
            parser.$(txt.substring(1, txt.length - 1))
        }
        // TIKZ
        , tikz: (token) => {
            parser.tikz(token.text)
        }
        // ESC
        , esc: () => { }
        // VAL
        , txt: (token) => {
            if (!stack.length) push('p')
            parser.txt(token.text)
        }
        // EOL
        , blank: () => { }
        , eol: () => {
            while (
                stack.length
                && top() !== 'p'
                && top() !== 'li') pop()
            if (top() === 'p') parser.eol()
        }
    }

    while (true) {
        const token = lexer.next()
        if (token === undefined) break
        actions[token.type as tokens](token)
    }

    while (stack.length) {
        parser.endElement(stack.pop() as typeElement)
    }

    return parser
}               