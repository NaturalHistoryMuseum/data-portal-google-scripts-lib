function load() {
    const PortalLib = PortalLibLoader.load();

    // expected ethanol values
    const ETHANOL_FILTER = {
        'or': [
            PortalLib.stringEquals('preservative', '100% ethanol'),
            PortalLib.stringEquals('preservative', '70% ethanol'),
            PortalLib.stringEquals('preservative', '80% ethanol'),
            PortalLib.stringEquals('preservative', 'ethanol'),
            PortalLib.stringEquals('preservative', 'spirit (ethanol)'),
        ]
    }
    // expected flash-frozen values
    const FROZEN_FILTER = {
        'or': [
            PortalLib.stringEquals('preservative', 'dry frozen (-200°c)'),
            PortalLib.stringEquals('preservative', 'dry frozen (-80°c)'),
            PortalLib.stringEquals('preservative', 'dry ice'),
            PortalLib.stringEquals('preservative', 'liquid nitrogen'),
        ]
    }
    // only things in the uk
    const UK_FILTER = PortalLib.stringEquals('country', 'United Kingdom');
    // only things from the DToL project
    const DTOL_FILTER = PortalLib.stringEquals('project', 'Darwin Tree of Life');

    /**
     * Retrieves the values in the given column between firstRow to lastRow.
     *
     * @param sheet the sheet to get the data from
     * @param column the column to extract
     * @param firstRow the first row to pull from
     * @param lastRow the last row to pull from
     * @returns {*} an array of values
     */
    function getValuesInColumn(sheet, column, firstRow, lastRow) {
        // unwrap the rows using a map call
        return sheet.getRange(`${column}${firstRow}:${column}${lastRow}`).getValues().map(row => row[0]);
    }

    /**
     * Update a range of values in a sheet based on a range of species names.
     *
     * @param targetSheet the sheet to get the species list from and update with the counts
     * @param genusColumn the column where the genus values come from
     * @param speciesColumn the column where the specific epithet values come from
     * @param filters an array of filters to search with, these will be sent to the Portal in an "and"
     * @param targetColumn the target column to insert the counts into
     * @param start the first row to read/write data from/to (default: 2)
     * @param end the last row to read/write data from/to (default: undefined which means max row)
     * @returns {Map<any, any>} a map of the species -> counts that have been updated on the sheet
     */
    function updateRange({targetSheet, genusColumn, speciesColumn, filters, targetColumn, start = 2, end = undefined}) {
        const sheet = SpreadsheetApp.getActive().getSheetByName(targetSheet);
        if (!end) {
            end = sheet.getMaxRows();
        }
        const genusValues = getValuesInColumn(sheet, genusColumn, start, end);
        const specificEpithetValues = getValuesInColumn(sheet, speciesColumn, start, end);

        let speciesCounts = new Map();
        genusValues.forEach((genus, index) => {
            const specificEpithet = specificEpithetValues[index];
            speciesCounts.set(`${genus} ${specificEpithet}`.toLowerCase(), 0);
        });

        // iterate over all the records that match the search on the Portal
        for (const record of PortalLib.searchAll({filters: {'and': filters}})) {
            // ignore records without a genus and specific epithet
            if (!!record.data.genus && !!record.data.specificEpithet) {
                const species = `${record.data.genus} ${record.data.specificEpithet}`.toLowerCase();
                if (speciesCounts.has(species)) {
                    // update the count for the species
                    speciesCounts.set(species, speciesCounts.get(species) + 1);
                }
            }
        }

        // create an array of counts to update the target column with
        let counts = genusValues.map((genus, index) => {
            const specificEpithet = specificEpithetValues[index];
            // each row needs to be an array, so wrap the count value
            return [speciesCounts.get(`${genus} ${specificEpithet}`.toLowerCase())];
        })
        // write the data to the sheet
        sheet.getRange(`${targetColumn}${start}:${targetColumn}${end}`).setValues(counts);

        return speciesCounts;
    }

    // exports
    return {
        'ETHANOL_FILTER': ETHANOL_FILTER,
        'FROZEN_FILTER': FROZEN_FILTER,
        'UK_FILTER': UK_FILTER,
        'DTOL_FILTER': DTOL_FILTER,
        'updateRange': updateRange,
    }
}
