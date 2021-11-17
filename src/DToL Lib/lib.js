function load() {
    const PortalLib = PortalLibLoader.load();

    // a list of preservative filters
    const ETHANOL_FILTER = {
        'or': [
            PortalLib.stringEquals('preservative', '100% ethanol'),
            PortalLib.stringEquals('preservative', 'ethanol'),
            PortalLib.stringEquals('preservative', '80% ethanol'),
            PortalLib.stringEquals('preservative', '70% ethanol'),
            PortalLib.stringEquals('preservative', '75% ethanol'),
            PortalLib.stringEquals('preservative', '96% ethanol'),
            PortalLib.stringEquals('preservative', 'ethanol 70% (for dna work)'),
            PortalLib.stringEquals('preservative', 'ethanol 100% (for dna work)'),
            PortalLib.stringEquals('preservative', 'ethanol 70%'),
            PortalLib.stringEquals('preservative', 'ethanol 80%'),
            PortalLib.stringEquals('preservative', '70%ethanol'),
            PortalLib.stringEquals('preservative', '90% ethanol'),
            PortalLib.stringEquals('preservative', '99% ethanol'),
            PortalLib.stringEquals('preservative', '95% ethanol'),
            PortalLib.stringEquals('preservative', 'spirit (ethanol)'),
        ]
    }
    const FROZEN_FILTER = {
        'or': [
            PortalLib.stringEquals('preservative', 'dry frozen (-200°c)'),
            PortalLib.stringEquals('preservative', 'dry frozen (-80°c)'),
            PortalLib.stringEquals('preservative', 'dry ice'),
            PortalLib.stringEquals('preservative', 'liquid nitrogen'),
            PortalLib.stringEquals('preservative', 'frozen'),
        ]
    }
    const UK_FILTER = PortalLib.stringEquals('country', 'United Kingdom');
    const DTOL_FILTER = PortalLib.stringEquals('project', 'Darwin Tree of Life');

    function getValuesInColumn(sheet, column, firstRow, lastRow) {
        return sheet.getRange(`${column}${firstRow}:${column}${lastRow}`).getValues().map(row => row[0]);
    }

    function updateRange({
                             targetSheet,
                             genusColumn,
                             speciesColumn,
                             filters,
                             targetColumn,
                             start = 2,
                             end = undefined
                         }) {
        const sheet = SpreadsheetApp.getActive().getSheetByName(targetSheet);
        if (!end) {
            end = sheet.getMaxRows();
        }
        const genusValues = getValuesInColumn(sheet, genusColumn, start, end);
        const specificEpithetValues = getValuesInColumn(sheet, speciesColumn, start, end);

        // use a map to ensure insertion order mirrors row order in the sheet
        let speciesCounts = new Map();
        genusValues.forEach((genus, index) => {
            const specificEpithet = specificEpithetValues[index];
            speciesCounts.set(`${genus} ${specificEpithet}`.toLowerCase(), 0);
        });

        for (const record of PortalLib.searchAll({filters: {'and': filters}})) {
            if (!!record.data.genus && !!record.data.specificEpithet) {
                const species = `${record.data.genus} ${record.data.specificEpithet}`.toLowerCase();
                if (speciesCounts.has(species)) {
                    speciesCounts.set(species, speciesCounts.get(species) + 1);
                }
            }
        }

        let counts = Array.from(speciesCounts.values()).map(count => [count]);
        sheet.getRange(`${targetColumn}${start}:${targetColumn}${end}`).setValues(counts);

        return speciesCounts;
    }

    return {
        'ETHANOL_FILTER': ETHANOL_FILTER,
        'FROZEN_FILTER': FROZEN_FILTER,
        'UK_FILTER': UK_FILTER,
        'DTOL_FILTER': DTOL_FILTER,
        'updateRange': updateRange,
    }
}
