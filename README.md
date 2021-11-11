# Data Portal Google Scripts

This repository contains a Google Scripts based around accessing the Data Portal API.
The code in this repository should be a mirror of the scripts in Google Scripts.

## Usage
These scripts are in use on the following sheets:

- [NHM_DToL_Invertebrate (non-insect)_Species](https://docs.google.com/spreadsheets/d/15CZrfDDsSRwLFAb9OQ134183a-vCuAFsw6O_YAucxQ8/edit?usp=sharing)
- [NHM_DToL_INSECTA_Species](https://docs.google.com/spreadsheets/d/1FZoRtZZEhbV3SwXo-UaDheqExGgegCbgey_nFnbYVaI/edit?usp=sharing)
- [NHM_DToL_Chordata_Species](https://docs.google.com/spreadsheets/d/1IAMTxGx1WCyinnP71T7OTZf0-YEGQxUa9-u2b32vOI4/edit?usp=sharing)
- [UK barcoding priority taxa](https://docs.google.com/spreadsheets/d/1Ntrfh0k8te8QQ4ROEuOs_DSSa3e5vPGMYU3TUFsGkao/edit?usp=sharing)
- [COPO Samples DToL](https://docs.google.com/spreadsheets/d/1erZxMnSvPas2T9bnUnj7oOMd3PUMeyf95uWeHIdC7Pw/edit?usp=sharing)
- [FreshBase - non-Arthropod Invertebrates](https://docs.google.com/spreadsheets/d/1abc6Qk6XFqTYSm9pXuaNYvFF0bNnYlT9IKR5NW3czDE/edit?usp=sharing)
- [FreshBase - Arthropods](https://docs.google.com/spreadsheets/d/1rshpvGr1HWlfeFR5nsHXshpBAOdiDFnIFnUK0b9dpcM/edit?usp=sharing)
- [FreshBase - RIVPACS](https://docs.google.com/spreadsheets/d/1g2c2m5KLbAtaplCNHlpoyOplP5qu3PvWaz73mM0APxQ/edit?usp=sharing)

Each of the above sheets has a directory under the `src/` directory.
Some of them use the two libraries currently held in this repository which are listed next.

## Libraries

### src/Portal Lib
**Script ID:** 1T_JhNQCf8x4PFQyV6RiYmFCTZZyRp1SMtRxrhEoeJNO-Gfpmg6LKpuWW

This dir contains the main Data Portal library which currently has functionality limited to searching and counting through the Portal's multisearch API (https://data.nhm.ac.uk/api.html).

### src/DToL Lib
**Script ID:** 1e1pCRjg-8DeGOE6LmEf5w6yJbwG6GNNVaWKWgzaOCerh-W8R2HG1zz8s

This dir contains the main Darwin Tree of Life (DToL) library which currently has functionality that enables it to update a spreadsheet containing taxonomic information with counts from the Data Portal API and BOLD for those taxons.
For the Data Portal API, this means counting how many of the given taxon are stored in ethonal and flash frozen stores.

This library is dependent on the Portal Lib.

## Script Management
To manage the scripts in this repository you will need to use [clasp](https://www.npmjs.com/package/@google/clasp).
You can install `clasp` by running:

```bash
npm install -g @google/clasp
```

then run `clasp login` to authenticate yourself with Google.

Each Google Script project lives in its own directory in the `src/` directory.
Before you run any `clasp` commands, you should `cd` into the project you which to manage, e.g.: `cd src/Portal Lib`.

The `clasp` docs cover usage in more detail, but the most common commands you'll need are:

- `clasp pull` - to pull the latest code from Google Script
- `clasp push` - to push the latest local code to Google Script

Be careful about how you use these in case anyone has made changes on one side of the connection without altering the
other.
