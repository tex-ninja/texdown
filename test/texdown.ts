import 'mocha';
import { expect } from 'chai';
import { texDown, Renderer, Element, Env, Cmd } from '../src/texdown';


class Test implements Renderer {
    public res = ''

    startEnv = (type: Env) => {
        this.res += `<div align='center'>`
    }

    endEnv = (type: Env) => {
        this.res += `</div>`
    }

    cmd = (name: Cmd, arg: string) => {
        this.res += `\\${name}\{${arg}\}`
    }

    hr = () => this.res += '<hr />'

    startElement = (type: Element) => {
        this.res += `<${type}>`
    }

    endElement = (type: Element) => {
        this.res += `</${type}>`
    }

    $$ = (tex: string) => this.res += `<$$>${tex}</$$>`
    $ = (tex: string) => this.res += `<$>${tex}</$>`

    a = (title: string, href: string) =>
        this.res += `<a href='${href}'>${title || href}</a>`
    img = (title: string, src: string) =>
        this.res += `<img title='${title}' src='${src}' />`

    txt = (val: string) => this.res += val
    tikz = (tikz: string) => this.res += `<tikz>${tikz}</tikz>`

    eol = () => { }
    blank = () => { }
    done = () => { }
}

describe('texDown', () => {
    const h6 = '###### h6'
    xit(h6, () => {
        const p = new Test()
        texDown(h6, p)
        expect(p.res).to.eq(
            '<h6>h6</h6>'
        )
    })

    const h5 = '##### h5'
    xit(h5, () => {
        const renderer = new Test()
        texDown(h5, renderer)
        expect(renderer.res).to.eq(
            '<h5>h5</h5>'
        )
    })

    const b = '*b*'
    xit(b, () => {
        const renderer = new Test()
        texDown(b, renderer)
        expect(renderer.res).to.eq(
            '<p><b>b</b></p>'
        )
    })

    const i = '/i/'
    xit(i, () => {
        const renderer = new Test()
        texDown(i, renderer)
        expect(renderer.res).to.eq(
            '<p><i>i</i></p>'
        )
    })

    const u = '_u_'
    xit(u, () => {
        const renderer = new Test()
        texDown(u, renderer)
        expect(renderer.res).to.eq(
            '<p><u>u</u></p>'
        )
    })

    const p = 'do\ng'
    xit(p, () => {
        const renderer = new Test()
        texDown(p, renderer)
        expect(renderer.res).to.eq(
            '<p>dog</p>'
        )
    })

    const ul = '- i1\n- i2'
    xit(ul, () => {
        const renderer = new Test()
        texDown(ul, renderer)
        expect(renderer.res).to.eq(
            '<ul><li>i1</li><li>i2</li></ul>'
        )
    })

    const ol = '1. i1\n2. i2'
    xit(ol, () => {
        const renderer = new Test()
        texDown(ol, renderer)
        expect(renderer.res).to.eq(
            '<ol><li>i1</li><li>i2</li></ol>'
        )
    })

    const $$1 = '$$\ntex\n$$'
    it($$1, () => {
        const renderer = new Test()
        texDown($$1, renderer)
        expect(renderer.res).to.eq(
            '<$$>\ntex\n</$$>'
        )
    })

    const $$2 = '\n$$\n\n$$\n'
    it($$2, () => {
        const renderer = new Test()
        texDown($$2, renderer)
        expect(renderer.res).to.eq(
            '<$$>\n\n</$$>'
        )
    })

    const $$3 = '$$\n$$'
    it($$3, () => {
        const renderer = new Test()
        texDown($$3, renderer)
        expect(renderer.res).to.eq(
            '<$$>\n</$$>'
        )
    })

    const $ = '$tex$'
    xit($, () => {
        const renderer = new Test()
        texDown($, renderer)
        expect(renderer.res).to.eq(
            '<p><$>tex</$></p>'
        )
    })

    const a = 'a [tex.ninja](http://tex.ninja)'
    xit(a, () => {
        const renderer = new Test()
        texDown(a, renderer)
        expect(renderer.res).to.eq(
            "<p>a <a href='http://tex.ninja'>tex.ninja</a></p>"
        )
    })

    const img = '![ninja](ninja.png)'
    xit(img, () => {
        const renderer = new Test()
        texDown(img, renderer)
        expect(renderer.res).to.eq(
            "<p><img title='ninja' src='ninja.png' /></p>"
        )
    })

    const tikz = '\\begin{tikzpicture}\ntikz\n\\end{tikzpicture}'
    xit(tikz, () => {
        const renderer = new Test()
        texDown(tikz, renderer)
        expect(renderer.res).to.eq(
            '<tikz>\\begin{tikzpicture}\ntikz\n\\end{tikzpicture}</tikz>'
        )
    })

    const hr = '# hr\n\n--'
    xit(hr, () => {
        const renderer = new Test()
        texDown(hr, renderer)
        expect(renderer.res).to.eq(
            `<h1>hr</h1><hr />`
        )
    })

    const center = '\\center'
    xit(center, () => {
        const renderer = new Test()
        texDown(center, renderer)
        expect(renderer.res).to.eq(
            `<div align='center'></div>`
        )
    })

    const cmd = '\\vspace{1cm}'
    xit(cmd, () => {
        const renderer = new Test()
        texDown(cmd, renderer)
        expect(renderer.res).to.eq(
            `\\vspace{1cm}`
        )
    })

    const format = '*b*/i/_u_'
    xit(format, () => {
        const renderer = new Test()
        texDown(format, renderer)
        expect(renderer.res).to.eq(
            `<p><b>b</b><i>i</i><u>u</u></p>`
        )
    })
})