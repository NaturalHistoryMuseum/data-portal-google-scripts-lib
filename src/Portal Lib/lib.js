function load() {
    // collection resource IDs
    const SPECIMENS = '05ff2255-c38a-40c9-b657-4ccb55ab2feb';
    const INDEX_LOTS = 'bb909597-dedf-427d-8c04-4c02b3a24db3';
    const ARTEFACTS = 'ec61d82a-748d-4b53-8e99-3e708e76bc4d';

    /**
     * Exception class that wraps errors from the Data Portal API.
     */
    class SearchError extends Error {
        constructor(statusCode, error) {
            super(`The search resulted in a ${statusCode}: ${JSON.stringify(error)}`);
            this.name = "SearchError";
        }
    }

    /**
     * Performs a search on the Data Portal multisearch API and returns the result. If any errors occur they are raised as a
     * SearchError.
     *
     * @param resourceIds a list of resource IDs to search (default: [SPECIMENS])
     * @param searchTerm free text search term matched across all fields (default: undefined)
     * @param filters object containing filters according to the multisearch API's query schema (default: undefined)
     * @param size the maximum number of records to return from the search (default: 100)
     * @param after used for pagination, if provided the search will begin after this value (after: undefined)
     * @param version the version to search at in milliseconds since the UNIX epoch (default: now at time of the searching)
     * @throws SearchError if there are any problems when calling the Data Portal API
     * @returns {*} the search result object
     */
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
            size: size,
            after: after,
            version: version,
        };
        if (!!searchTerm || !!filters) {
            data.query = {
                search: searchTerm,
                filters: filters,
            }
        }
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

    /**
     * Performs a count on the Data Portal multisearch API and returns the result. If any errors occur they are raised as a
     * SearchError.
     *
     * @param resourceIds a list of resource IDs to search (default: [SPECIMENS])
     * @param searchTerm free text search term matched across all fields (default: undefined)
     * @param filters object containing filters according to the multisearch API's query schema (default: undefined)
     * @param version the version to search at in milliseconds since the UNIX epoch (default: now at time of the searching)
     * @throws SearchError if there are any problems when calling the Data Portal API
     * @returns {*} the number of records that match the search parameters
     */
    function count({
                       resourceIds = [SPECIMENS],
                       searchTerm = undefined,
                       filters = undefined,
                       version = Date.now()
                   }) {
        return search({resourceIds, searchTerm, filters, size: 0, after: undefined, version}).total;
    }

    function* searchAll({
                            resourceIds = [PortalLib.SPECIMENS],
                            searchTerm = undefined,
                            filters = undefined,
                            chunkSize = 500,
                            version = Date.now()
                        }) {
        let after = undefined;
        while (true) {
            const result = search({
                resourceIds: resourceIds,
                searchTerm: searchTerm,
                filters: filters,
                size: chunkSize,
                after: after,
                version: version
            });
            // after is null when there's no more data
            if (!result.after) {
                break;
            }
            yield* result.records;
            after = result.after;
        }
    }

    /**
     * Convenience function which creates a string_equals block for inclusion in searches/counts filter blocks.
     * @param field the field to search over
     * @param value the value to match to the field's value
     * @returns {{string_equals: {fields: *[], value}}}
     */
    function stringEquals(field, value) {
        return {
            string_equals: {
                // TODO: multiple fields
                fields: [field],
                value: value
            }
        }
    }

    /**
     * Convenience function which creates a string_contains block for inclusion in searches/counts filter blocks.
     * @param field the field to search over
     * @param value the value to match to the field's value
     * @returns {{string_contains: {fields: *[], value}}}
     */
    function stringContains(field, value) {
        return {
            string_contains: {
                // TODO: multiple fields
                fields: [field],
                value: value
            }
        }
    }

    return {
        'search': search,
        'searchAll': searchAll,
        'count': count,
        'stringEquals': stringEquals,
        'stringContains': stringContains,
        'SearchError': SearchError,
        'SPECIMENS': SPECIMENS,
        'INDEX_LOTS': INDEX_LOTS,
        'ARTEFACTS': ARTEFACTS,
    }
}
