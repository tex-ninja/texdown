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

    it('**', () => {
        expect(marko('**')).to.eql({
            type: 'doc'
            , kids: [{
                type: 'b'
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
})