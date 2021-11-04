/**
 * Update the "copoData" sheet with the latest data from the COPO API for the DToL samples held
 * there. This script uses the COPO API, for more info on that, see: https://copo-project.org/api/.
 */
function updateDTOLSampleData() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('copoData');

  // the first row contains the fields from the COPO API that we want to display in the sheet, so
  // grab the data
  const fields = sheet.getDataRange().getDisplayValues()[0];

  // we're going to update the whole sheet in one go because it's significantly faster, this array
  // will contain all the rows we're going to write into the sheet at the end 
  let data = [];

  // retrieve the COPO IDs for all the DToL samples
  const response = UrlFetchApp.fetch("https://copo-project.org/api/sample/dtol/");
  // parse the response data as JSON
  const responseData = JSON.parse(response.getContentText());
  // grab all the COPO IDs from the array of objects returned by the API
  const copoIds = responseData.data.map(entry => entry.copo_id);

  // the COPO API provides an endpoint for retrieving the data for multiple COPO IDs in one request
  // however, it has some unknown limit on how many can be retrieved at once, hence we'll chunk our
  // requests. Also we should be nice and not request hundreds at a time!
  const chunkSize = 50;
  for (let i = 0, j = copoIds.length; i < j; i += chunkSize) {
    // extract the chunk of COPO IDs we're going to work on next
    const chunk = copoIds.slice(i, i + chunkSize);
    // get the sample data associated with these COPO IDs
    const sampleResponse = UrlFetchApp.fetch(`https://copo-project.org/api/sample/copo_id/${chunk.join()}/`);
    // parse the JSON response
    const sampleResponseData = JSON.parse(sampleResponse.getContentText());

    // for each of the samples in the response, create an array representing a row in the sheet with
    // the data from the sample for each field in the header. If the field is absent from the
    // sample, just add an empty string
    sampleResponseData.data.forEach(sample => {
      let row = [];
      fields.forEach(field => {
        if (!!sample[field]) {
          // if the sample data contains the field, push it to the row
          row.push(sample[field]);
        } else if (Array.isArray(sample['species_list']) && sample['species_list'].some(species => !!species[field])) {
          // if the field isn't in the sample but there is a species_list field and the field is found in that, then we
          // join all the values together into a single string separated by pipes
          row.push(sample['species_list'].map(species => species[field] || '').join(' | '));
        } else {
          row.push('');
        }
      });
      data.push(row);
    });

    Logger.log(`Fetched ${data.length}/${copoIds.length} samples`);
  }

  // now that we've gathered the data we want to put in the sheet we need to clear it (if necessary)
  const rowCount = sheet.getMaxRows();
  if (rowCount > 1) {
    sheet.deleteRows(2, rowCount - 1);
  }

  // now add the data into the sheet, first specify the range we want to update
  const targetRange = sheet.getRange(2, 1, data.length, fields.length);
  // write the data
  targetRange.setValues(data);
  // clear any formatting (the header row is currently bold and without doing this the entire sheet
  // goes bold!)
  targetRange.clearFormat();

  // donesies
  Logger.log(`Wrote ${data.length} rows`);
}
