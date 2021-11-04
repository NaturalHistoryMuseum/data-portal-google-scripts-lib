function reset() {
    DToLLib.resetMark();
}

function main() {
    const higherTaxa = new Map([
        ['G', 'family'],
        ['F', 'order'],
        ['E', 'class'],
        ['D', 'subphylum'],
        ['C', 'phylum']
    ]);

    DToLLib.updateCounts({
        targetSheet: 'progress',
        limit: 50,
        genusColumn: 'H',
        speciesColumn: 'I',
        higherTaxa: higherTaxa,
        ethanolColumn: 'M',
        frozenColumn: 'P',
        boldColumn: 'T',
        ukOnly: true
    })
}
