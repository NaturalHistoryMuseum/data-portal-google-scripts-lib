# Data Portal Google Scripts

This repository contains a Google Scripts based around accessing the Data Portal API.

## Libraries

### src/Portal Lib
**Script ID: 1T_JhNQCf8x4PFQyV6RiYmFCTZZyRp1SMtRxrhEoeJNO-Gfpmg6LKpuWW**

This dir contains the main Data Portal library which currently has functionality limited to searching and counting through the Portal's multisearch API (https://data.nhm.ac.uk/api.html).

### src/DToL Lib
**Script ID: 1e1pCRjg-8DeGOE6LmEf5w6yJbwG6GNNVaWKWgzaOCerh-W8R2HG1zz8s**

This dir contains the main Darwin Tree of Life (DToL) library which currently has functionality that enables it to update a spreadsheet containing taxonomic information with counts from the Data Portal API and BOLD for those taxons.
For the Data Portal API, this means counting how many of the given taxon are stored in ethonal and flash frozen stores.

This library is dependant on the Portal Lib.
