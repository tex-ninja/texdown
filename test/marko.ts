import 'mocha';
import { expect } from 'chai'
import { marko } from '../src/marko'

describe('marko', () => {
    const h1 = '# *h1* $a^* = b$ \\*\\\\'
    xit(h1, () => {
        expect(marko(h1)).to.eql({
            type: 'doc', val: [{
                type: 'h1', val: [{
                    type: 'b', val: [{
                        val: 'h1'
                    }]
                }, {
                    val: ' '
                }, {
                    type: '$', val: [{
                        val: 'a^'
                    }, {
                        val: '*'
                    }, {
                        val: ' = b'
                    }]
                }, {
                    val: ' '
                }, {
                    val: '*'
                }, {
                    val: '\\'
                }]
            }]
        })
    })

    const p = '# h1\np1\n\np2\n# h1'
    xit(p, () => {
        expect(marko(p)).to.eql({
            type: 'doc', val: [{
                type: 'h1', val: [{
                    val: 'h1'
                }]
            }, {
                type: 'p', val: [{
                    val: 'p1'
                }]
            }, {
                type: 'p', val: [{
                    val: 'p2'
                }]
            }, {
                type: 'h1', val: [{
                    val: 'h1'
                }]
            }]
        })
    })

    const ul = 'ul\n- i1\n- i2'
    it(ul, () => {
        expect(marko(ul)).to.eql({
            type: 'doc', val: [{
                type: 'p', val: [{
                    val: 'ul'
                }]
            }, {
                type: 'ul', val: [{
                    type: 'li', val: [{ val: 'i1' }]
                }, {
                    type: 'li', val: [{ val: 'i2' }]
                }]
            }]
        })
    })

    xit('**\\***', () => {
        expect(marko('**\\***')).to.eql({
            type: 'doc'
            , val: [{
                type: 'b'
                , val: [{
                    type: ''
                    , val: '\\*'
                }]
            }]
        })
    })

    xit('p', () => {
        expect(marko('p')).to.eql({
            type: 'doc'
            , val: [{
                type: 'p'
                , val: [{
                    type: ''
                    , val: 'p'
                }]
            }]
        })
    })

    xit('-', () => {
        expect(marko('-')).to.eql({
            type: 'doc'
            , val: [{
                type: 'ul'
                , val: [{
                    type: 'li'
                    , val: []
                }]
            }]
        })
    })
})