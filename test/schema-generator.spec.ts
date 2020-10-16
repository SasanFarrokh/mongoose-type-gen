import {Schema} from 'mongoose'
import * as fs from 'fs'
import {SchemaParser} from "../src/schema-parser";

describe('snapshot test', function () {
    it('should match generated type', function () {

        const family = new Schema({
            familyName: String
        })

        const user = new Schema({
            name: String,
            lastname: {
                type: String,
            },
            rank: Number,
            books: [
                {
                    type: String,
                    default: ['My Book']
                }
            ],
            authId: Schema.Types.ObjectId,
            info: {
                email: String,
                github: {
                    type: String,
                    required: true
                },
                npm: {
                    url: String,
                }
            },
            matrix3D: [[[String]]],
            family: family
        }, {
            timestamps: true
        })

        user.virtual('fullName').get(function (this: any) {
            return this.name + this.lastname
        })

        user.virtual('fullNameTyped', { type: [String] }).get(function (this: any) {
            return this.name + this.lastname
        })

        ;(user.method as any)('writeBook', () => {console.log('writing book')}, {s: true})

        user.static('findUserByBook', function (this: any, book: any) {
            return this.find({ book })
        })

        console.info(user)

        const output = (new SchemaParser(user, 'User')).toString()

        fs.promises.writeFile('./example.ts', output.toString())
        expect(output).toMatchSnapshot();
    });
});

