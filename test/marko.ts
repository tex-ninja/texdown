import 'mocha';
import { expect } from 'chai'
import { marko } from '../src/marko'

describe('marko', () => {
    const h1 = '# *h1* $a^* = b$ \\*\\\\'
    xit(h1, () => {
        expect(marko(h1)).to.eql({
            type: 'doc', kids: [{
                type: 'h1', kids: [{
                    type: 'b', kids: [{
                        val: 'h1'
                    }]
                }, {
                    val: ' '
                }, {
                    type: '$', kids: [{
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
            type: 'doc', kids: [{
                type: 'h1', kids: [{
                    val: 'h1'
                }]
            }, {
                type: 'p', kids: [{
                    val: 'p1'
                }]
            }, {
                type: 'p', kids: [{
                    val: 'p2'
                }]
            }, {
                type: 'h1', kids: [{
                    val: 'h1'
                }]
            }]
        })
    })

    const ul = 'ul\n- i1\n- i2'
    it(ul, () => {
        expect(marko(ul)).to.eql({
            type: 'doc', kids: [{
                type: 'p', kids: [{
                    val: 'ul'
                }]
            }, {
                type: 'ul', kids: [{
                    type: 'li', kids: [{ val: 'i1' }]
                }, {
                    type: 'li', kids: [{ val: 'i2' }]
                }]
            }]
        })
    })

    xit('**\\***', () => {
        expect(marko('**\\***')).to.eql({
            type: 'doc'
            , kids: [{
                type: 'b'
                , kids: [{
                    type: ''
                    , val: '\\*'
                }]
            }]
        })
    })

    xit('p', () => {
        expect(marko('p')).to.eql({
            type: 'doc'
            , kids: [{
                type: 'p'
                , kids: [{
                    type: ''
                    , val: 'p'
                }]
            }]
        })
    })

    xit('-', () => {
        expect(marko('-')).to.eql({
            type: 'doc'
            , kids: [{
                type: 'ul'
                , kids: [{
                    type: 'li'
                    , kids: []
                }]
            }]
        })
    })
})