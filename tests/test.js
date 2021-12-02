const assert = require('assert');
const {suite, test} = require('mocha');
const sinon = require('sinon');
const PortalLib = require('./adapter');

suite('#search()', function () {
    test('should default parameters when none are passed', function () {
        const mockResult = 'testing!';
        const mockResponse = {
            'getContentText': sinon.fake.returns(JSON.stringify({'result': mockResult})),
            'getResponseCode': sinon.fake.returns(200),
        };
        const fakeFetch = sinon.fake.returns(mockResponse);
        global.UrlFetchApp = {fetch: fakeFetch};

        let result = PortalLib.search({});
        assert.strictEqual(result, 'testing!');
        assert(fakeFetch.calledOnce);

        const [url, options] = fakeFetch.args[0];
        assert.strictEqual(url, 'https://data.nhm.ac.uk/api/3/action/datastore_multisearch');
        assert.strictEqual(options['method'], 'post');
        assert.strictEqual(options['contentType'], 'application/json');
        assert(options['muteHttpExceptions']);
        const parsedOptions = JSON.parse(options['payload']);
        assert.strictEqual(parsedOptions.size, 100);
        assert.deepStrictEqual(parsedOptions.resource_ids, [PortalLib.SPECIMENS]);
        assert.strictEqual(typeof parsedOptions['version'], 'number');
        assert(!('query' in parsedOptions));
        assert(!('after' in parsedOptions));
    });

    test('should pass on parameters when they are passed', function () {
        const mockResult = 'testing!';
        const mockResponse = {
            'getContentText': sinon.fake.returns(JSON.stringify({'result': mockResult})),
            'getResponseCode': sinon.fake.returns(200),
        };
        const fakeFetch = sinon.fake.returns(mockResponse);
        global.UrlFetchApp = {fetch: fakeFetch};
        const filters = {
            "and": [
                {
                    "string_equals": {
                        "fields": [
                            "continent"
                        ],
                        "value": "Asia"
                    }
                },
                {
                    "string_equals": {
                        "fields": [
                            "lifeStage"
                        ],
                        "value": "egg"
                    }
                }
            ]
        };
        let result = PortalLib.search({
            resourceIds: [PortalLib.ARTEFACTS, PortalLib.INDEX_LOTS],
            searchTerm: 'banana',
            filters: filters,
            size: 14,
            after: 'afterValue',
            version: 1636632607000
        });
        assert.strictEqual(result, 'testing!');
        assert(fakeFetch.calledOnce);

        const [url, options] = fakeFetch.args[0];
        assert.strictEqual(url, 'https://data.nhm.ac.uk/api/3/action/datastore_multisearch');
        assert.strictEqual(options['method'], 'post');
        assert.strictEqual(options['contentType'], 'application/json');
        assert(options['muteHttpExceptions']);
        const parsedOptions = JSON.parse(options['payload']);
        assert.strictEqual(parsedOptions.size, 14);
        assert.deepStrictEqual(parsedOptions.resource_ids, [PortalLib.ARTEFACTS, PortalLib.INDEX_LOTS]);
        assert.strictEqual(parsedOptions.version, 1636632607000);
        assert.strictEqual(parsedOptions.after, 'afterValue');
        assert.strictEqual(parsedOptions.query.search, 'banana');
        assert.deepStrictEqual(parsedOptions.query.filters, filters);
    });

    test('should throw a SearchError when a non-200 status code is returned', function () {
        const mockResponse = {
            'getContentText': sinon.fake.returns(JSON.stringify({'error': 'argh!'})),
            'getResponseCode': sinon.fake.returns(500),
        };
        const fakeFetch = sinon.fake.returns(mockResponse);
        global.UrlFetchApp = {fetch: fakeFetch};

        assert.throws(
            () => {
                PortalLib.search({});
            },
            new PortalLib.SearchError(500, 'argh!')
        )
    });
});


suite('#stringEquals()', function () {
    test('should return a valid filter block', function () {
        const block = PortalLib.stringEquals('testField', 'testValue');
        assert.deepStrictEqual(block, {
            'string_equals': {
                'fields': ['testField'],
                'value': 'testValue'
            }
        })
    });
});
