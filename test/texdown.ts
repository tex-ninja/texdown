import 'mocha';
import { expect } from 'chai';
import { texDown, parser, typeElement } from '../src/texdown';


class Parser implements parser {
    public res = ''

    startElement = (type: typeElement) => {
        this.res += `<${type}>`
    }

    endElement = (type: typeElement) => {
        this.res += `</${type}>`
    }

    $$ = (tex: string) => this.res += `<$$>${tex}</$$>`
    $ = (tex: string) => this.res += `<$>${tex}</$>`
    a = (title: string, href: string) =>
        this.res += `<a href='${href}'>${title || href}</a>`
    txt = (val: string) => this.res += val
    tikz = (tikz: string) => this.res += `<tikz>${tikz}</tikz>`

    eol = () => this.res += '<br/>'
}

describe('texDown', () => {
    const h6 = '###### h6'
    it(h6, () => {
        expect(texDown(h6, new Parser()).res).to.eq(
            '<h6>h6</h6>'
        )
    })

    const h5 = '##### h5'
    it(h5, () => {
        expect(texDown(h5, new Parser()).res).to.eq(
            '<h5>h5</h5>'
        )
    })

    const b = '*b*'
    it(b, () => {
        expect(texDown(b, new Parser()).res).to.eq(
            '<b>b</b>'
        )
    })

    const i = '/i/'
    it(i, () => {
        expect(texDown(i, new Parser()).res).to.eq(
            '<i>i</i>'
        )
    })

    const u = '_u_'
    it(u, () => {
        expect(texDown(u, new Parser()).res).to.eq(
            '<u>u</u>'
        )
    })

    const p = 'l1\nl2'
    it(p, () => {
        expect(texDown(p, new Parser()).res).to.eq(
            '<p>l1<br/>l2</p>'
        )
    })

    const ul = '- i1\n- i2'
    it(ul, () => {
        expect(texDown(ul, new Parser()).res).to.eq(
            '<ul><li>i1</li><li>i2</li></ul>'
        )
    })

    const ol = '1. i1\n2. i2'
    it(ol, () => {
        expect(texDown(ol, new Parser()).res).to.eq(
            '<ol><li>i1</li><li>i2</li></ol>'
        )
    })

    const $$ = '$$\ntex\n$$\n'
    it($$, () => {
        expect(texDown($$, new Parser()).res).to.eq(
            '<$$>tex</$$>'
        )
    })

    const $ = '$tex$'
    it($, () => {
        expect(texDown($, new Parser()).res).to.eq(
            '<$>tex</$>'
        )
    })

    const a = '[tex.ninja](http://tex.ninja)'
    it(a, () => {
        expect(texDown(a, new Parser()).res).to.eq(
            "<a href='http://tex.ninja'>tex.ninja</a>"
        )
    })

    const tikz = '\\begin{tikzpicture}\ntikz\n\\end{tikzpicture}'
    it(tikz, () => {
        expect(texDown(tikz, new Parser()).res).to.eq(
            '<tikz>\\begin{tikzpicture}\ntikz\n\\end{tikzpicture}</tikz>'
        )
    })
})