import {program} from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import {Schema} from "mongoose";
import {SchemaParser} from "./schema-parser";

program.on('--help', () => {
});

program
    .action(async (cmd: any) => {
        let schemaPaths: string[] = cmd.args.slice()
        if (!schemaPaths || !schemaPaths.length) {
            console.error(
                'No schema files could be found. Please check the required usage by running `ms2tsi -h`',
            );
            return process.exit(1);
        }
        const currentDir = process.env.PWD as string;
        schemaPaths = schemaPaths
            .filter((p: string) => !p.match(/\.d\.ts$/))
            .map((p: string) => path.resolve(currentDir, p))

        const promises = schemaPaths.map((schemaPath: string) => {
            const schemaFile = require(schemaPath);
            for (const key in schemaFile) {
                console.log(`  Generating: ` + schemaPath)
                if (schemaFile[key] instanceof Schema) {
                    const parser = new SchemaParser(schemaFile[key], key)
                    return fs.promises.writeFile(schemaPath.replace(/\.ts/i, '.d.ts'), parser.toString())
                }
            }
        })
        await Promise.all(promises)
    });

program.parse(process.argv);
