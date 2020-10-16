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

### Sample
```typescript
import {Schema} from "mongoose";

const family = new Schema({
    familyName: String
})

const User = new Schema({
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

User.virtual('fullName').get(function (this: any) {
    return this.name + this.lastname
})

User.virtual('fullNameTyped', { type: [String] }).get(function (this: any) {
    return this.name + this.lastname
})

User.method('writeBook', () => {
    console.log('writing book')
})

User.static('findUserByBook', function (this: any, book: any) {
    return this.find({ book })
})

export {
    User
}
```

The schema above will be transformed into

```typescript
import { Schema, Model, Document } from 'mongoose' 

interface UserInfoNpm {
    url?: string;
}

interface UserInfo {
    email?: string;
    github: string;
    npm: UserInfoNpm;
}

interface UserFamily {
    familyName?: string;
    id?: any;
}

export interface User {
    name?: string;
    lastname?: string;
    rank?: number;
    books?: string[];
    authId?: Schema.Types.ObjectId;
    info: UserInfo;
    matrix3D?: string[][][];
    family: UserFamily;
    updatedAt?: Date;
    createdAt?: Date;
    fullName?: any;
    fullNameTyped?: string[];
    initializeTimestamps: Function;
    writeBook: Function;
}

export type UserDocument = User & Document
export interface UserModel extends Model<UserDocument> {
    findUserByBook: Function;
}


export type UserSchema = Schema
```
