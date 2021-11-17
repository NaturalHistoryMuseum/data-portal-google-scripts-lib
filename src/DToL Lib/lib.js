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
const DTOL_FILTER = PortalLib.stringEquals('project', 'Darwin Tree of Life')
const MARK_PROPERTY_NAME = 'mark';


function getValuesInColumn(sheet, column, firstRow, lastRow) {
    return sheet.getRange(`${column}${firstRow}:${column}${lastRow}`).getValues().map(row => row[0]);
}

function resetMark() {
    PropertiesService.getDocumentProperties().deleteProperty(MARK_PROPERTY_NAME);
}

function getMark() {
    let start = PropertiesService.getDocumentProperties().getProperty(MARK_PROPERTY_NAME);
    return (start === null) ? 2 : parseInt(start);
}

function setMark(row) {
    PropertiesService.getDocumentProperties().setProperty(MARK_PROPERTY_NAME, row.toString());
}

function getRankRows(sheet, firstRow, lastRow, speciesColumn, genusColumn, higherTaxa) {
    let ranks = ['specificEpithet', 'genus'];
    let rankColumns = [
        getValuesInColumn(sheet, speciesColumn, firstRow, lastRow),
        getValuesInColumn(sheet, genusColumn, firstRow, lastRow)
    ];
    if (higherTaxa) {
        higherTaxa.forEach((rank, column) => {
            ranks.push(rank);
            rankColumns.push(getValuesInColumn(sheet, column, firstRow, lastRow));
        });
    }
    let rankRows = [];
    for (let i = 0; i < rankColumns[0].length; i++) {
        rankRows.push(rankColumns.map(column => column[i]));
    }
    return [ranks, rankRows]
}

function updateCounts({
                          targetSheet,
                          genusColumn,
                          speciesColumn,
                          higherTaxa = undefined,
                          limit = 100,
                          ethanolColumn = undefined,
                          frozenColumn = undefined,
                          boldColumn = undefined,
                          ukOnly = false
                      }) {
    const sheet = SpreadsheetApp.getActive().getSheetByName(targetSheet);
    const firstRow = getMark();
    if (limit === undefined) {
        limit = sheet.getLastRow();
    }
    const lastRow = Math.min(firstRow + limit - 1, sheet.getLastRow());

    let [ranks, rankRows] = getRankRows(sheet, firstRow, lastRow, speciesColumn, genusColumn, higherTaxa);

    let counts = new Map();
    rankRows.forEach(row => {
        let filter = [DTOL_FILTER];
        if (row[0] && row[1]) {
            filter.push(PortalLib.stringEquals('specificEpithet', row[0]));
            filter.push(PortalLib.stringEquals('genus', row[1]));
        } else {
            let value = row.slice(1).find(element => !!element);
            filter.push(PortalLib.stringEquals(ranks[row.indexOf(value)], value));
        }
        if (filter && ukOnly) {
            filter.push(UK_FILTER);
        }

        if (ethanolColumn) {
            const count = !filter ? 0 : PortalLib.count({filters: {'and': filter.concat(ETHANOL_FILTER)}});
            setDefault(counts, ethanolColumn, []).push([count]);
        }

        if (frozenColumn) {
            const count = !filter ? 0 : PortalLib.count({filters: {'and': filter.concat(FROZEN_FILTER)}});
            setDefault(counts, frozenColumn, []).push([count]);
        }

        if (boldColumn) {
            setDefault(counts, boldColumn, []).push([getBoldCount(row[0], row[1], ukOnly)]);
        }
    });

    counts.forEach((values, column) => {
        sheet.getRange(`${column}${firstRow}:${column}${firstRow + values.length - 1}`).setValues(values);
    });

    if (lastRow >= sheet.getLastRow()) {
        resetMark();
    } else {
        setMark(lastRow + 1);
    }

    return counts;
}

function setDefault(map, key, defaultValue) {
    if (!map.has(key)) {
        map.set(key, defaultValue);
    }
    return map.get(key);
}

function getBoldCount(species, genus, ukOnly) {
    let url = `https://www.boldsystems.org/index.php/API_Public/stats?format=json&taxon=${genus} ${species}`;

    if (ukOnly) {
        url += `&geo=United Kingdom`;
    }
    const options = {
        'method': 'get',
        'muteHttpExceptions': true
    };
    let response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
        const responseData = JSON.parse(response.getContentText());
        return responseData.total_records;
    } else {
        return 0;
    }
}
