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
    filters: [DToLLib.ETHANOL_FILTER],
    targetColumn: 'L'
  });

  // update all the flash frozen counts
  DToLLib.updateRange({
    targetSheet: targetSheet,
    genusColumn: genusColumn,
    speciesColumn: speciesColumn,
    filters: [DToLLib.FROZEN_FILTER],
    targetColumn: 'O'
  });

  // TODO: BOLD?
}
