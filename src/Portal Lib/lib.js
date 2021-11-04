// collection resource IDs
const SPECIMENS = '05ff2255-c38a-40c9-b657-4ccb55ab2feb';
const INDEX_LOTS = 'bb909597-dedf-427d-8c04-4c02b3a24db3';
const ARTEFACTS = 'ec61d82a-748d-4b53-8e99-3e708e76bc4d';

class SearchError extends Error {
    constructor(statusCode, error) {
        super(`The search resulted in a ${statusCode}: ${JSON.stringify(error)}`);
        this.name = "SearchError";
    }
}

function search({
                    resourceIds = [SPECIMENS],
                    searchTerm = undefined,
                    filters = undefined,
                    size = 100,
                    after = undefined,
                    version = Date.now()
                }) {
    const url = "https://data.nhm.ac.uk/api/3/action/datastore_multisearch";
    const data = {
        resource_ids: resourceIds,
        query: {
            search: searchTerm,
            filters: filters,
        },
        size: size,
        after: after,
        version: version,
    };
    const options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(data),
        'muteHttpExceptions': true
    };
    let response = UrlFetchApp.fetch(url, options);
    let fullResult = JSON.parse(response.getContentText());
    let statusCode = response.getResponseCode();
    if (statusCode === 200) {
        return fullResult.result;
    } else {
        throw new SearchError(statusCode, fullResult.error);
    }
}

function count({resourceIds = [SPECIMENS], searchTerm = undefined, filters = undefined, version = Date.now()}) {
    return search({resourceIds, searchTerm, filters, size: 0, after: undefined, version}).total;
}


function stringEquals(field, value) {
    return {
        string_equals: {
            fields: [field],
            value: value
        }
    }
}
