# Object-reference

## Install

```bash
npm i --save object-reference
```

## How to use

```js
const objectReference = require('object-reference');

const data = {
    "a": "%b%",
    "b": "valueB"
};

objectReference.parse(data);
// data is now equal to {"a": "valueB", "b": "valueB"}
// data.a.should.equal(data.b);
```

## Examples

Object path reference
```js
const data = {
    "a": "%b.c%",
    "b": {
        "c": "valueC"
    }
};

objectReference.parse(data);
// data is now equal to {"a": "valueC", "b": {"c": "valueC" }}
// data.a.should.equal(data.b.c);
```

Reference inside string
```js
const data = {
    "a": "%b%/valueA",
    "b": "valueB"
};

objectReference.parse(data);
// data is now equal to {"a": "valueB/valueA", "b": "valueB" }
// data.a.should.equal("valueB/valueA");
```

Multi references inside string
```js
const data = {
    "a": "%b%/%c%",
    "b": "valueB",
    "c": "valueC"
};

objectReference.parse(data);
// data is now equal to {"a": "valueB/valueC", "b": "valueB", "c": "valueC" }
// data.a.should.equal("valueB/valueC");
```

Chain references
```js
const data = {
    "a": "%b%",
    "b": "%c%",
    "c": "valueC"
};

objectReference.parse(data);
// data is now equal to {"a": "valueC", "b": "valueC", "c": "valueC" }
// data.a.should.equal(data.c);
// data.b.should.equal(data.c);
```

Reference to an Object
```js
const data = {
    "a": "%b%",
    "b": {
        "c": "%d%"   
    },
    "d": "valueD"
};

objectReference.parse(data);
// data is now equal to {"a": {"c": "valueD"}, "b": {"c": "valueD"}, "d": "valueD" }
// data.a.should.equal(data.b);
// data.a.c.should.equal(data.d);
// data.b.c.should.equal(data.d);
```

## ObjectReference methods

```js

export interface ObjectReferenceOptions {
    referenceCharKey?: string; // default '%'
    recursive?: boolean;       // default true
    global?: object;           // default {}
}

setOptions(opts: ObjectReferenceOptions): ObjectReference;

parse(data: Array<any>|Object): ObjectReference;

parseReferences(value: string, referenceCharKey?: string): string;

getReferenceKeys(value: string, referenceCharKey?: string): Array<string>;

hasReferences(value: string, referenceCharKey?: string): boolean;

isValidReference(value: string, referenceCharKey?: string): boolean;
```

## Simple app config example

```json
// ./config.json
{
    "app": {
        "secret": "my_awesome_secret",
        "default_locale": "en",
        "folders": {
            "public": "%cwd%/public",
            "views": "%cwd%/views",
            "routers": "%cwd%/routers"
        },
        "locales": [
            "%app.default_locale%", 
            "fr"
        ]
    },
    "database": {
        "host": "127.0.0.1",
        "name": "test"
    },
    "session": {
        "secret": "%app.secret%"
    },
    "i18n": {
        "locales": "%app.locales%",
        "defaultLocale": "%app.default_locale%"
    }
}
```

```js
// ./app.js
const ObjectReference = require('object-reference');

const objectReference = ObjectReference({
    global: {
        "cwd": process.cwd()
    }
});
/*
objectReference.setOptions({
    global: {
        "cwd": process.cwd()
    }
});
*/

const config = require('./config.json');

objectReference.parse(config);

```