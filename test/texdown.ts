import 'mocha';
import { expect } from 'chai'
import { texdown, visitor, nopVisitor, visit, visitor } from '../src/texdown'

describe('texdown', () => {
    const h1 = '# *h1* $a^* = b$ \\*\\\\'
    it(h1, () => {
        expect(texdown(h1)).to.eql({
            type: 'doc', kids: [{
                type: 'h1', kids: [{
                    type: 'b', kids: [{
                        type: '', val: 'h1'
                    }]
                }, {
                    type: '', val: ' '
                }, {
                    type: '$', val: 'a^* = b'
                }, {
                    type: '', val: ' '
                }, {
                    type: '', val: '*'
                }, {
                    type: '', val: '\\'
                }]
            }]
        })
    })

    const p = '# h1\np1l1\np1l2\n\np2l1\n# h1'
    it(p, () => {
        expect(texdown(p)).to.eql({
            type: 'doc', kids: [{
                type: 'h1', kids: [{
                    type: '', val: 'h1'
                }]
            }, {
                type: 'br'
            }, {
                type: 'p', kids: [{
                    type: '', val: 'p1l1'
                }, {
                    type: 'br'
                }, {
                    type: '', val: 'p1l2'
                }, {
                    type: 'br'
                }]
            }, {
                type: 'br'
            }, {
                type: 'p', kids: [{
                    type: '', val: 'p2l1'
                }, {
                    type: 'br'
                }]
            }, {
                type: 'h1', kids: [{
                    type: '', val: 'h1'
                }]
            }]
        })
    })

    const ul = 'ul\n- i1\n- i2'
    it(ul, () => {
        expect(texdown(ul)).to.eql({
            type: 'doc', kids: [{
                type: 'p', kids: [{
                    type: '', val: 'ul'
                }, {
                    type: 'br'
                }]
            }, {
                type: 'ul', kids: [{
                    type: 'li', kids: [{
                        type: '', val: 'i1'
                    }]
                }, {
                    type: 'br'
                }, {
                    type: 'li', kids: [{
                        type: '', val: 'i2'
                    }]
                }]
            }]
        })
    })

    const links = '[title1](href) ![title2](img)'
    it(links, () => {
        expect(texdown(links)).to.eql({
            type: 'doc', kids: [{
                type: 'p', kids: [{
                    type: 'a', title: 'title1', href: 'href'
                }, {
                    type: '', val: ' '
                }, {
                    type: 'img', title: 'title2', href: 'img'
                }]
            }]
        })
    })

    const txt = '[]'
    it(txt, () => {
        expect(texdown(txt)).to.eql({
            type: 'doc', kids: [{
                type: 'p', kids: [{
                    type: '', val: '[]'
                }]
            }]
        })
    })

    const $ = '$ 50\\$ \\leq 100\\$ $'
    it($, () => {
        expect(texdown($)).to.eql({
            type: 'doc', kids: [{
                type: 'p', kids: [{
                    type: '$', val: ' 50\\$ \\leq 100\\$ '
                }]
            }]
        })
    })

    const $$ = '$$ a \\leq b $$'
    it($$, () => {
        expect(texdown($$)).to.eql({
            type: 'doc', kids: [{
                type: '$$', val: ' a \\leq b '
            }]
        })
    })

    const notmath = '$\\'
    it(notmath, () => {
        expect(texdown(notmath)).to.eql({
            type: 'doc', kids: [{
                type: 'p', kids: [{
                    type: '', val: '$'
                }, {
                    type: '', val: '\\'
                }]
            }]
        })
    })

    const v = '# h1\n\np1'
    it(v, () => {
        type n = {
            n: string
            , v: string
            , k: n[]
        }

        const visitor: visitor<n> = {
            '': (val, p) => {
                const e = { n: '', k: [], v: val }
                p.k.push(e)
                return e
            }
            , $: (val, p) => ({ n: '', k: [], v: '' })
            , $$: (val, p) => ({ n: '', k: [], v: '' })
            , br: (p) => ({ n: '', k: [], v: '' })
            , a: (title, href, p) => ({ n: '', k: [], v: '' })
            , img: (title, src, p) => ({ n: '', k: [], v: '' })
            , element: (type, p) => {
                const e = { n: type, k: [], v: '' }
                p.k.push(e)
                return e
            }
        }
        const doc = visit(texdown(v), visitor, { n: 'doc', v: '', k: [] })
        expect(doc).to.eql({
            n: 'doc', v: '', k: [{
                n: 'h1', v: '', k: [{
                    n: '', v: 'h1', k: []
                }]
            }, {
                n: 'p', v: '', k: [{
                    n: '', v: 'p1', k: []
                }]
            }]
        })
    })
})