import 'mocha';
import { expect } from 'chai'
import { texdown, visit, visitor } from '../src/texdown'

describe('texdown', () => {
    const pop = '*b\nt'
    it(pop, () => {
        expect(texdown(pop)).to.eql({
            type: 'div', kids: [{
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: 'b', kids: [{
                            type: '', val: 'b'
                        }]
                    }]
                }, {
                    type: 'span', kids: [{
                        type: '', val: 't'
                    }]
                }]
            }]
        })
    })

    const b = '*b*'
    it(b, () => {
        expect(texdown(b)).to.eql({
            type: 'div', kids: [{
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: 'b', kids: [{
                            type: '', val: 'b'
                        }]
                    }]
                }]
            }]
        })
    })

    const i = '/i/'
    it(i, () => {
        expect(texdown(i)).to.eql({
            type: 'div', kids: [{
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: 'i', kids: [{
                            type: '', val: 'i'
                        }]
                    }]
                }]
            }]
        })
    })

    const u = '_u_'
    it(u, () => {
        expect(texdown(u)).to.eql({
            type: 'div', kids: [{
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: 'u', kids: [{
                            type: '', val: 'u'
                        }]
                    }]
                }]
            }]
        })
    })

    const h1 = '# *h1* $a^* = b$ \\*\\\\'
    it(h1, () => {
        expect(texdown(h1)).to.eql({
            type: 'div', kids: [{
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
            type: 'div', kids: [{
                type: 'h1', kids: [{
                    type: '', val: 'h1'
                }]
            }, {
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: '', val: 'p1l1'
                    }]
                }, {
                    type: 'span', kids: [{
                        type: '', val: 'p1l2'
                    }]
                }]
            }, {
                type: 'br'
            }, {
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: '', val: 'p2l1'
                    }]
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
            type: 'div', kids: [{
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: '', val: 'ul'
                    }]
                }]
            }, {
                type: 'ul', kids: [{
                    type: 'li', kids: [{
                        type: 'span', kids: [{
                            type: '', val: 'i1'
                        }]
                    }]
                }, {
                    type: 'li', kids: [{
                        type: 'span', kids: [{
                            type: '', val: 'i2'
                        }]
                    }]
                }]
            }]
        })
    })

    const links = '[title1](href) ![title2](img)'
    it(links, () => {
        expect(texdown(links)).to.eql({
            type: 'div', kids: [{
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: 'a', title: 'title1', href: 'href'
                    }, {
                        type: '', val: ' '
                    }, {
                        type: 'img', title: 'title2', href: 'img'
                    }]
                }]
            }]
        })
    })

    const txt = '[]'
    it(txt, () => {
        expect(texdown(txt)).to.eql({
            type: 'div', kids: [{
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: '', val: '[]'
                    }]
                }]
            }]
        })
    })

    const $ = '$ 50\\$ \\leq 100\\$ $'
    it($, () => {
        expect(texdown($)).to.eql({
            type: 'div', kids: [{
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: '$', val: ' 50\\$ \\leq 100\\$ '
                    }]
                }]
            }]
        })
    })

    const $$ = '$$\n a \\leq b \n$$\n'
    it($$, () => {
        expect(texdown($$)).to.eql({
            type: 'div', kids: [{
                type: '$$', val: '\n a \\leq b \n'
            }]
        })
    })

    const notmath = '$\\'
    it(notmath, () => {
        expect(texdown(notmath)).to.eql({
            type: 'div', kids: [{
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: '', val: '$'
                    }, {
                        type: '', val: '\\'
                    }]
                }]
            }]
        })
    })

    const v = '# h1\n\np1'
    it(v, () => {
        type n = {
            t: string
            , v: string
            , k: n[]
        }

        const visitor: visitor<n> = {
            '': (val, p) => {
                const e = { t: '', k: [], v: val }
                p.k.push(e)
            }
            , $: (val, p) => undefined
            , $$: (val, p) => undefined
            , br: (p) => undefined
            , a: (title, href, p) => undefined
            , img: (title, src, p) => undefined
            , doc: () => ({ t: 'div', k: [], v: '' })
            , element: (type, p) => {
                const e = { t: type, k: [], v: '' }
                p.k.push(e)
                return e
            }
        }

        const ast = texdown(v)
        expect(ast).to.eql({
            type: 'div', kids: [{
                type: 'h1', kids: [
                    { type: '', val: 'h1' }
                ]
            }, {
                type: 'br'
            }, {
                type: 'p', kids: [{
                    type: 'span', kids: [{
                        type: '', val: 'p1'
                    }]
                }]
            }]
        })

        const doc = visit(ast, visitor)
        expect(doc).to.eql({
            t: 'div', v: '', k: [{
                t: 'h1', v: '', k: [
                    { t: '', v: 'h1', k: [] }
                ]
            }, {
                t: 'p', v: '', k: [{
                    t: 'span', v: '', k: [{
                        t: '', v: 'p1', k: []
                    }]
                }]
            }]
        })
    })
})