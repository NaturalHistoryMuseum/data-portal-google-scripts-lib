function reset() {
  DToLLib.resetMark();
}

function main() {
  DToLLib.updateCounts({
    targetSheet: 'progress',
    limit: 50,
    genusColumn: 'H',
    speciesColumn: 'I',
    ethanolColumn: 'L',
    frozenColumn: 'O',
    boldColumn: 'S'
  })
}
