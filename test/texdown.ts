import 'mocha';
import { expect } from 'chai';
import { texdown, parser, typeElement } from '../src/texdown';


class Parser implements parser {
    public res = ''

    startElement = (type: typeElement) => {
        this.res += `<${type}>`
    }

    endElement = (type: typeElement) => {
        this.res += `</${type}>`
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