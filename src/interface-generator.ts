import { EOL } from 'os'

const INDENT_CHAR = '    '

export type InterfaceGeneratorTypeDef = { name: string, optional?: boolean, arrayDepth?: number };

export class InterfaceGenerator {
    private deps: InterfaceGenerator[] = []
    private fields = new Map<string, InterfaceGeneratorTypeDef>()

    constructor(
        public readonly name: string,
        public exports: boolean,
        public readonly extend?: string,
    ) {}

    addField(name: string, type: InterfaceGeneratorTypeDef | InterfaceGenerator) {
        if (type instanceof InterfaceGenerator) {
            if (type.name !== this.name) {
                this.deps.push(type)
            }
            this.fields.set(name, { name: type.name })
        } else {
            this.fields.set(name, type)
        }
    }

    addDep(ig: InterfaceGenerator) {
        this.deps.push(ig)
    }

    toString() {
        let result = ''
        for (const dep of this.deps) {
            result += dep.toString()
        }
        result += `${this.exports ? 'export ' : ''}interface ${this.name}${this.extend ? ' extends ' + this.extend : ''} {` + EOL

        result += InterfaceGenerator.fieldsToString(this.fields, INDENT_CHAR, 1)

        result += '}'
        return result.trim() + EOL + EOL
    }

    static fieldsToString(fields: Map<string, InterfaceGeneratorTypeDef>, indent = '', newLine = 1) {
        let result = ''
        const repeatString = (str: string, repeat: number): string => new Array(repeat).fill(str).join('');

        fields.forEach((type, name) => {
            result += `${indent}${name}${type.optional ? '?' : ''}: ${type.name}${repeatString('[]', type.arrayDepth || 0)};` + repeatString(EOL, newLine)
        })
        return result
    }
}
