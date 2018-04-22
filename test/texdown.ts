import 'mocha';
import { expect } from 'chai'
import { texdown } from '../src/texdown'

describe('marko', () => {
    const h1 = '# *h1* $a^* = b$ \\*\\\\'
    xit(h1, () => {
        expect(texdown(h1)).to.eql({
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
        expect(texdown(p)).to.eql({
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
    xit(ul, () => {
        expect(texdown(ul)).to.eql({
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

    const links = '[title1](href) ![title2](img)'
    it(links, () => {
        expect(texdown(links)).to.eql({
            type: 'doc', kids: [{
                type: 'p', kids: [{
                    type: 'a', title: 'title1', src: 'href'
                }, {
                    val: ' '
                }, {
                    type: 'img', title: 'title2', src: 'img'
                }]
            }]
        })
    })

    xit('p', () => {
        expect(texdown('p')).to.eql({
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
        expect(texdown('-')).to.eql({
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