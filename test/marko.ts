import 'mocha';
import { expect } from 'chai'
import { marko } from '../src/marko'

describe('parse', () => {
    it('#', () => {
        expect(marko('#')).to.eql(
            {
                type: 'doc'
                , kids: [{
                    type: 'h1'
                    , kids: []
                }]
            }
        )
    })
    it('**', () => {
        marko('**')
        expect(1).to.eql(1)
    })
})