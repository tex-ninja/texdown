import 'mocha';
import { expect } from 'chai'
import { texdown } from '../src/texdown'

describe('marko', () => {
    const h1 = '# *h1* $a^* = b$ \\*\\\\'
    it(h1, () => {
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

    const p = '# h1\np1l1\np1l2\n\np2l1\n# h1'
    it(p, () => {
        expect(texdown(p)).to.eql({
            type: 'doc', kids: [{
                type: 'h1', kids: [{
                    val: 'h1'
                }]
            }, {
                type: 'br'
            }, {
                type: 'p', kids: [{
                    val: 'p1l1'
                }, {
                    type: 'br'
                }, {
                    val: 'p1l2'
                }, {
                    type: 'br'
                }]
            }, {
                type: 'br'
            }, {
                type: 'p', kids: [{
                    val: 'p2l1'
                }, {
                    type: 'br'
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
        expect(texdown(ul)).to.eql({
            type: 'doc', kids: [{
                type: 'p', kids: [{
                    val: 'ul'
                }, {
                    type: 'br'
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
})