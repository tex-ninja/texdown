import 'mocha';
import { expect } from 'chai'
import { marko } from '../src/marko'

describe('marko', () => {
    const h1 = '# *h1* $a^* = b$ \\*\\\\'
    xit(h1, () => {
        expect(marko(h1)).to.eql({
            type: 'doc', val: [{
                type: 'h1', val: [{
                    type: '', val: ' '
                }, {
                    type: 'b', val: [{
                        type: '', val: 'h1'
                    }]
                }, {
                    type: '', val: ' '
                }, {
                    type: '$', val: [{
                        type: '', val: 'a^'
                    }, {
                        type: '', val: '*'
                    }, {
                        type: '', val: ' = b'
                    }]
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

    const p = '# h1\np1\n\np2'
    it(p, () => {
        expect(marko(p)).to.eql({
            type: 'doc', val: [{
                type: 'h1', val: [{
                    type: '', val: ' h1'
                }]
            }, {
                type: 'p', val: [{
                    type: '', val: 'p1'
                }]
            }, {
                type: 'p', val: [{
                    type: '', val: 'p2'
                }]
            }]
        })
    })

    xit('**b**', () => {
        expect(marko('**b**')).to.eql({
            type: 'doc'
            , val: [{
                type: 'p'
                , val: [{
                    type: 'b'
                    , val: 'b'
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