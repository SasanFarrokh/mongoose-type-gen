# Mongoose Type Gen

A Cli tool for generating typescript definitions for mongoose schemas

### Supported features

- [x] Virtuals
- [x] Instance methods
- [x] Static methods
- [x] Timestamps
- [x] Nested Fields
- [x] Embedded Schemas
- [x] Required fields
- [ ] Custom data types
- [ ] Typings for method arguments and return types
- [ ] Refs

### Usage


```shell script
# Locally in your project.
npm install -D mongoose-type-gen

# Or globally with TypeScript.
npm install -g mongoose-type-gen
```

And generate `.d.ts` files with the cli command:

```shell script
$: mongoose-type-gen ./src/models/*.ts
```
