// function reset() {
//     DToLLib.resetMark();
// }
//
// function main() {
//     const higherTaxa = new Map([
//         ['G', 'family'],
//         ['F', 'order'],
//         ['E', 'class'],
//         ['D', 'subphylum'],
//         ['C', 'phylum']
//     ]);
//
//     DToLLib.updateCounts({
//         targetSheet: 'progress',
//         limit: 50,
//         genusColumn: 'H',
//         speciesColumn: 'I',
//         higherTaxa: higherTaxa,
//         ethanolColumn: 'M',
//         frozenColumn: 'P',
//         boldColumn: 'T',
//         ukOnly: true
//     })
// }

function main() {
    const DToLLib = DToLLibLoader.load();
    const targetSheet = 'progress';
    const genusColumn = 'H';
    const speciesColumn = 'I';

    // update all the ethanol counts
    DToLLib.updateRange({
        targetSheet: targetSheet,
        genusColumn: genusColumn,
        speciesColumn: speciesColumn,
        filters: [DToLLib.UK_FILTER].concat(DToLLib.ETHANOL_FILTER),
        targetColumn: 'M'
    });

    // update all the flash frozen counts
    DToLLib.updateRange({
        targetSheet: targetSheet,
        genusColumn: genusColumn,
        speciesColumn: speciesColumn,
        filters: [DToLLib.UK_FILTER].concat(DToLLib.FROZEN_FILTER),
        targetColumn: 'P'
    });

    // TODO: BOLD?
    // TODO: higher taxon search?
    // TODO: uk only?
}
