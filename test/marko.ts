import 'mocha';
import { expect } from 'chai'
import { marko } from '../src/marko'

describe('parse', () => {
    it('#', () => {
        expect(marko('#')).to.eql({
            type: 'doc'
            , kids: [{
                type: 'h1'
                , kids: []
            }]
        })
    })

    it('# h1', () => {
        expect(marko('# h1')).to.eql({
            type: 'doc'
            , kids: [{
                type: 'h1'
                , kids: [{
                    type: 'txt'
                    , text: ' h1'
                }]
            }]
        })
    })

    it('**', () => {
        expect(marko('**')).to.eql({
            type: 'doc'
            , kids: [{
                type: 'b'
                , kids: []
            }]
        })
    })

    it('**b**', () => {
        expect(marko('**b**')).to.eql({
            type: 'doc'
            , kids: [{
                type: 'b'
                , kids: [{
                    type: 'txt'
                    , text: 'b'
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
                    type: 'txt'
                    , text: '\\*'
                }]
            }]
        })
    })

    it('p', () => {
        expect(marko('p')).to.eql({
            type: 'doc'
            , kids: [{
                type: 'p'
                , kids: [{
                    type: 'txt'
                    , text: 'p'
                }]
            }]
        })
    })
})