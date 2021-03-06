import 'mocha';
import { expect } from 'chai';
import { texDown, Renderer, Element } from '../src/texdown';


class Test implements Renderer {
    public res = ''

    startEnv = (name: string) => {
        this.res += `<div class='${name}'>`
    }

    endEnv = (name: string) => {
        this.res += `</div>`
    }

    cmd = (name: string, arg: string) => {
        this.res += `\\${name}\{${arg}\}`
    }

    hr = () => this.res += '<hr />'

    startElement = (el: Element) => {
        this.res += `<${el.type}>`
    }

    endElement = (el: Element) => {
        this.res += `</${el.type}>`
    }

    $$ = (tex: string) => this.res += `<$$>${tex}</$$>`
    $ = (tex: string) => this.res += `<$>${tex}</$>`

    a = (title: string, href: string) =>
        this.res += `<a href='${href}'>${title || href}</a>`
    img = (title: string, src: string) =>
        this.res += `<img title='${title}' src='${src}' />`

    esc = (val: string) => this.res += val[0]
    txt = (val: string) => this.res += val
    tikz = (tikz: string) => this.res += `<tikz>${tikz}</tikz>`

    eol = () => { }
    blank = () => { }
    done = () => { }
}

describe('texDown', () => {
    const h6 = '###### h6'
    it(h6, () => {
        const p = new Test()
        texDown(h6, p)
        expect(p.res).to.eq(
            '<h6>h6</h6>'
        )
    })

    const h5 = '##### h5'
    it(h5, () => {
        const renderer = new Test()
        texDown(h5, renderer)
        expect(renderer.res).to.eq(
            '<h5>h5</h5>'
        )
    })

    const b = '*b*'
    it(b, () => {
        const renderer = new Test()
        texDown(b, renderer)
        expect(renderer.res).to.eq(
            '<p><b>b</b></p>'
        )
    })

    const i = '/i/'
    it(i, () => {
        const renderer = new Test()
        texDown(i, renderer)
        expect(renderer.res).to.eq(
            '<p><i>i</i></p>'
        )
    })

    const u = '_u_'
    it(u, () => {
        const renderer = new Test()
        texDown(u, renderer)
        expect(renderer.res).to.eq(
            '<p><u>u</u></p>'
        )
    })

    const p = 'do\ng'
    it(p, () => {
        const renderer = new Test()
        texDown(p, renderer)
        expect(renderer.res).to.eq(
            '<p>dog</p>'
        )
    })

    const ul = '- i1\n- i2'
    it(ul, () => {
        const renderer = new Test()
        texDown(ul, renderer)
        expect(renderer.res).to.eq(
            '<ul><li>i1</li><li>i2</li></ul>'
        )
    })

    const ul2 = '- i1\n - i11\n- i2'
    it(ul2, () => {
        const renderer = new Test()
        texDown(ul2, renderer)
        expect(renderer.res).to.eq(
            '<ul><li>i1</li><ul><li>i11</li></ul><li>i2</li></ul>'
        )
    })

    const ol = '1. i1\n2. i2'
    it(ol, () => {
        const renderer = new Test()
        texDown(ol, renderer)
        expect(renderer.res).to.eq(
            '<ol><li>i1</li><li>i2</li></ol>'
        )
    })

    const ol2 = '1. i1\n 1. i11\n2. i2'
    it(ol2, () => {
        const renderer = new Test()
        texDown(ol2, renderer)
        expect(renderer.res).to.eq(
            '<ol><li>i1</li><ol><li>i11</li></ol><li>i2</li></ol>'
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
    it($, () => {
        const renderer = new Test()
        texDown($, renderer)
        expect(renderer.res).to.eq(
            '<p><$>tex</$></p>'
        )
    })

    const a = 'a [tex.ninja](http://tex.ninja)'
    it(a, () => {
        const renderer = new Test()
        texDown(a, renderer)
        expect(renderer.res).to.eq(
            "<p>a <a href='http://tex.ninja'>tex.ninja</a></p>"
        )
    })

    const img = '![ninja](ninja.png)'
    it(img, () => {
        const renderer = new Test()
        texDown(img, renderer)
        expect(renderer.res).to.eq(
            "<p><img title='ninja' src='ninja.png' /></p>"
        )
    })

    const tikz = '\\begin{tikzpicture}\ntikz\n\\end{tikzpicture}'
    it(tikz, () => {
        const renderer = new Test()
        texDown(tikz, renderer)
        expect(renderer.res).to.eq(
            '<tikz>\\begin{tikzpicture}\ntikz\n\\end{tikzpicture}</tikz>'
        )
    })

    const hr = '# hr\n\n--'
    it(hr, () => {
        const renderer = new Test()
        texDown(hr, renderer)
        expect(renderer.res).to.eq(
            `<h1>hr</h1><hr />`
        )
    })

    const center = '\\center'
    it(center, () => {
        const renderer = new Test()
        texDown(center, renderer)
        expect(renderer.res).to.eq(
            `<div class='center'></div>`
        )
    })

    const cmd = '\\vspace{1cm}'
    it(cmd, () => {
        const renderer = new Test()
        texDown(cmd, renderer)
        expect(renderer.res).to.eq(
            `\\vspace{1cm}`
        )
    })

    const format = '*b*/i/_u_'
    it(format, () => {
        const renderer = new Test()
        texDown(format, renderer)
        expect(renderer.res).to.eq(
            `<p><b>b</b><i>i</i><u>u</u></p>`
        )
    })

    const esc = '//__**'
    it(esc, () => {
        const renderer = new Test()
        texDown(esc, renderer)
        expect(renderer.res).to.eq(
            `/_*`
        )
    })
})