import {Schema, VirtualType} from "mongoose";
import {InterfaceGenerator, InterfaceGeneratorTypeDef} from "./interface-generator";
import {EOL} from "os";

type FieldMap = Map<string, FieldMap | string>

export class SchemaParser {
    private imports: string[];

    constructor(private readonly schema: any, readonly name: string) {
        if (!(schema instanceof Schema)) {
            console.warn('Schema is not instanceof mongoose Schema')
        }
        this.imports = [
            `import { Schema, Model, Document } from 'mongoose' ${EOL + EOL}`
        ]
    }

    fields(tree: Record<string, any>) {
        return Object.entries(tree).filter(([field, type]) => isNaN(+field) && field !== '_id')
    }

    resolveGenerator(tree: Record<string, any>, deps: string[]): InterfaceGenerator {
        const ig = new InterfaceGenerator([this.name].concat(deps).map(el => el[0].toUpperCase() + el.slice(1)).join(''), false)

        this.fields(tree).forEach(([field, type]) => {
            ig.addField(field, this.resolveType(field, type, deps));
        })
        return ig;

    }

    private resolveType(field: string, type: any, deps: string[] = []): InterfaceGeneratorTypeDef | InterfaceGenerator {
        if (this.isVirtualType(type)) {
            // Any for virtual types
            let typeDef: InterfaceGeneratorTypeDef;
            try {
                typeDef = { name: this.resolveNativeType(type.options.type) }
            } catch (err) {
                console.warn(`Virtual field '${field}' is not typed`)
                typeDef = { name: 'any' }
            }
            typeDef.optional = true;
            return typeDef
        }
        else if (this.isNestedObjectType(field, deps, type)) {
            return this.resolveGenerator(type, deps.concat(field))
        }
        else if (this.isNestedSchemaType(type)) {
            return this.resolveGenerator(type.tree, deps.concat(field))
        }
        else if (this.isArrayType(type)) {
            type = this.resolveNativeType(type[0])
            return {
                arrayDepth: 1,
                name: type,
                optional: !type[0].required
            }
        } else {
            return {
                name: this.resolveNativeType(type),
                optional: !type.required
            }
        }
    }
    private resolveNativeType(typeDef: any): string {
        const type = typeDef.type && (typeof typeDef.type === 'function') ? typeDef.type : typeDef;
        switch (true) {
            case type instanceof Schema.Types.ObjectId || type.schemaName === 'ObjectId' || type === 'ObjectId':
                return 'Schema.Types.ObjectId'
            case type === String || type === Schema.Types.String:
                return 'string'
            case type === Number || type === Schema.Types.Number:
                return 'number'
            case type === Boolean || type === Schema.Types.Boolean:
                return 'boolean'
            case type === Date:
                return 'Date'
            case type === Schema.Types.Mixed:
                return 'any'
            case Array.isArray(type):
                return this.resolveNativeType(type[0]) + '[]'
        }
        console.info(typeDef)
        throw new Error('Type is not supported: ' + JSON.stringify(typeDef))
    }

    isVirtualType(fieldConfig: any): boolean {
        return fieldConfig instanceof VirtualType;
    }

    private isNestedObjectType(field: string, deps: string[], fieldConfig: any): boolean {
        return this.schema.nested[deps.concat(field).join('.')] === true
    }

    private isNestedSchemaType(fieldConfig: any): boolean {
        return fieldConfig instanceof Schema;
    }

    private isArrayType(field: any): boolean {
        return Array.isArray(field);
    }

    toString() {
        const rootInterfaceGenerator = this.resolveGenerator(this.schema.tree, []);
        for (const method in this.schema.methods) {
            rootInterfaceGenerator.addField(method, { name: 'Function' })
        }
        rootInterfaceGenerator.exports = true;

        const modelInterface = new InterfaceGenerator(this.name + 'Model', true,`Model<${this.name}Document>`)
        for (const method in this.schema.statics) {
            modelInterface.addField(method, { name: 'Function' })
        }

        const exports = [
            `export type ${this.name}Document = ${this.name} & Document`,
            modelInterface.toString(),
        ]
        return this.imports.join(EOL) + rootInterfaceGenerator.toString() + exports.join(EOL);
    }
}
