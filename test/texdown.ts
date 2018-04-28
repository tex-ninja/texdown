import 'mocha';
import { expect } from 'chai';
import { texdown, parser, typeElement } from '../src/texdown';


class Parser implements parser {
    public res = ''

    private startElement = (type: typeElement) => {
        this.res += `<${type}>`
    }

    private endElement = (type: typeElement) => {
        this.res += `</${type}>`
    }

    public start = {
        h6: () => this.startElement('h6')
        , h5: () => this.startElement('h5')
        , h4: () => this.startElement('h4')
        , h3: () => this.startElement('h3')
        , h2: () => this.startElement('h2')
        , h1: () => this.startElement('h1')
        , b: () => this.startElement('b')
        , i: () => this.startElement('i')
        , u: () => this.startElement('u')
        , p: () => this.startElement('p')
    }
    public end = {
        h6: () => this.endElement('h6')
        , h5: () => this.endElement('h5')
        , h4: () => this.endElement('h4')
        , h3: () => this.endElement('h3')
        , h2: () => this.endElement('h2')
        , h1: () => this.endElement('h1')
        , b: () => this.endElement('b')
        , i: () => this.endElement('i')
        , u: () => this.endElement('u')
        , p: () => this.endElement('p')
    }
    txt = (val: string) => this.res += val
}

describe('texdown', () => {
    const h6 = '###### h6'
    it(h6, () => {
        expect(texdown(h6, new Parser()).res).to.eq('<h6>h6</h6>')
    })

    const h5 = '##### h5'
    it(h5, () => {
        expect(texdown(h5, new Parser()).res).to.eq('<h5>h5</h5>')
    })

    const b = '*b*'
    it(b, () => {
        expect(texdown(b, new Parser()).res).to.eq('<b>b</b>')
    })

    const p = 'p'
    it(p, () => {
        expect(texdown(p, new Parser()).res).to.eq('<p>p</p>')
    })
})