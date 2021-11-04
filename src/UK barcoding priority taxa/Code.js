function getNHMCount(genus, species, mcfOnly) {
    let and = [
        PortalLib.stringEquals('genus', genus),
        PortalLib.stringEquals('specificEpithet', species),
    ]
    if (mcfOnly) {
        and.push({
            'or': [
                PortalLib.stringEquals('subDepartment', 'molecular collections'),
                PortalLib.stringEquals('subDepartment', 'molecular lab'),
            ]
        })
    }
    return PortalLib.count({filters: {'and': and}})
}

function getBoldCount(genus, species, ukOnly) {
    let url = `https://www.boldsystems.org/index.php/API_Public/stats?format=json&dataType=overview`;

    url += `&taxon=${genus} ${species}`

    if (ukOnly) {
        url += `&geo=United Kingdom`;
    }

    const options = {
        'method': 'get',
        'muteHttpExceptions': true
    }
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() == 200) {
        const responseData = JSON.parse(response.getContentText());
        return responseData.total_records;
    } else {
        Logger.log('Failed to get %s + %s + %s due to %s', genus, species, ukOnly, response.getResponseCode());
        return -1;
    }
}

function reset() {
    const documentProperties = PropertiesService.getDocumentProperties();
    documentProperties.deleteProperty('start');
}

function getStart() {
    const documentProperties = PropertiesService.getDocumentProperties();
    let start = documentProperties.getProperty('start');
    return (start === null) ? 2 : parseInt(start);
}

function updateCounts() {
    const documentProperties = PropertiesService.getDocumentProperties();
    const sheet = SpreadsheetApp.getActive().getSheetByName('progress');
    const numberOfRows = sheet.getLastRow();

    const start = getStart();
    const end = Math.min(start + 50, numberOfRows);

    let data = [];

    sheet.getRange(`H${start}:I${end}`).getValues().forEach(searchTerms => {
        const genus = searchTerms[0];
        const species = searchTerms[1];

        const baseNHMCount = getNHMCount(genus, species, false);
        // only get mcf specific record count if there were any records for the base search (time saver!)
        const mcfCount = (baseNHMCount > 0) ? getNHMCount(genus, species, true) : 0;

        const baseBOLDCount = getBoldCount(genus, species, false);
        // only get UK specific record count from BOLD if there were any records for the base search (time saver!)
        // NOTE: this is a time save and a bug avoider - seems that if you request the counts using a taxon and
        //       a geo filter, if the taxon filter comes back with a count of 0 then the geo filter is the only
        //       filter applied and you get back a count that is way too high. Not sure if this is a problem
        //       specifically with geo filters/taxon filters/combo of these/everything but this avoids that issue
        const boldUKCount = (baseBOLDCount > 0) ? getBoldCount(genus, species, true) : 0;

        data.push([baseNHMCount, mcfCount, baseBOLDCount, boldUKCount]);
    })

    if (!!data) {
        const firstColumn = 'L'.toLowerCase().charCodeAt() - 97 + 1;
        // now add the data into the sheet, first specify the range we want to update
        const targetRange = sheet.getRange(start, firstColumn, data.length, 4);
        // write the data
        targetRange.setValues(data);
    }

    if (end >= numberOfRows) {
        documentProperties.deleteProperty('start');
        Logger.log('Reached the end of the sheet, will start from the top next time');
    } else {
        documentProperties.setProperty('start', (end + 1).toString());
        Logger.log(`More to go next time - we handled ${start} -> ${end}`);
    }
}
