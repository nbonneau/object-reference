const should = require('chai').should();

const ObjectReference = require('../index');

describe('object-parser: parse()', function() {
    it('default reference', function() {

        const objectReference = ObjectReference();

        const data = {
            "a": "valueA",
            "b": "%a%"
        };

        objectReference.parse(data);

        data.b.should.equal(data.a);
        data.b.should.be.a(typeof data.a);
    });
    it('path reference', function() {

        const objectReference = ObjectReference();

        const data = {
            "a": {
                "c": "valueC"
            },
            "b": "%a.c%"
        };

        objectReference.parse(data);

        data.b.should.equal(data.a.c);
    });
    it('path reference with sub-reference', function() {

        const objectReference = ObjectReference();

        const data = {
            "a": "%b%",
            "b": {
                "c": "%d%"
            },
            "d": 1
        };

        objectReference.parse(data);

        should.exist(data.a.c);
        data.a.c.should.be.a(typeof data.d);
        data.b.c.should.be.a(typeof data.d);
        data.b.c.should.equal(data.d);
        data.a.c.should.equal(data.d);
    });
    it('global reference', function() {

        const cwd = process.cwd();

        const objectReference = ObjectReference({
            global: {
                cwd
            }
        });

        const data = {
            "a": "%cwd%"
        };

        objectReference.parse(data);

        data.a.should.equal(cwd);
    });
    it('reference inside string', function() {

        const cwd = process.cwd();

        const objectReference = ObjectReference();

        const data = {
            "absolute_path": "%cwd%/dir_name",
            "cwd": cwd
        };

        objectReference.parse(data);

        data.absolute_path.should.equal(data.cwd + '/dir_name');
    });
    it('references inside string', function() {

        const cwd = process.cwd();

        const objectReference = ObjectReference();

        const data = {
            "dir_name": "test",
            "absolute_path": "%cwd%/%dir_name%",
            "cwd": cwd
        };

        objectReference.parse(data);

        data.absolute_path.should.equal(data.cwd + '/' + data.dir_name);
    });
    it('no recursive', function() {

        const objectReference = ObjectReference({
            recursive: false
        });

        const data = {
            "a": "%b%",
            "b": {
                "c": "%d%"
            },
            "d": "valueD"
        };

        objectReference.parse(data);

        should.exist(data.a.c);
        data.a.c.should.equal("%d%");
    });
    it('path reference to reference', function() {

        const objectReference = ObjectReference();

        const data = {
            "a": "%b.c%",
            "b": {
                "c": "%d%"
            },
            "d": "valueD"
        };

        objectReference.parse(data);

        data.a.should.equal(data.d);
    });
    it('reference inside array', function() {

        const objectReference = ObjectReference();

        const data = {
            "a": [
                "%b.c%",
                "%d%"
            ],
            "b": {
                "c": "%d%"
            },
            "d": "valueD"
        };

        objectReference.parse(data);

        data.a[0].should.equal(data.d);
        data.a[1].should.equal(data.d);
    });
    it('reference not found', function() {

        const objectReference = ObjectReference();

        const data = {
            "a": "%b.d%",
            "b": {
                "c": "%d%"
            },
            "d": "valueD",
            "e": "%f%"
        };

        objectReference.parse(data);

        data.a.should.equal("%b.d%");
        data.e.should.equal("%f%");
    });
    it('reference not found from path reference', function() {

        const objectReference = ObjectReference();

        const data = {
            "a": "%b.c%",
            "b": {
                "c": "%e%"
            },
            "d": "valueD"
        };

        objectReference.parse(data);

        data.a.should.equal("%b.c%");
        data.b.c.should.equal("%e%");
    });
    it('custom reference char', function() {

        const objectReference = ObjectReference({
            referenceCharKey: '='
        });

        const data = {
            "a": "valueA",
            "b": "=a="
        };

        objectReference.parse(data);

        data.b.should.equal(data.a);
    });
    it('custom reference char', function() {

        const objectReference = ObjectReference();

        const data = {
            "a": "valueA",
            "b": "=a="
        };

        objectReference.setOptions({
            referenceCharKey: '='
        });

        objectReference.parse(data);

        data.b.should.equal(data.a);
    });
});