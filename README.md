# Data Portal Google Scripts Library

This repository contains a Google Scripts library based around accessing the Data Portal API.

## Usage

Currently the library has limited functionality focused around searching and counting through
the Portal's multisearch API (https://data.nhm.ac.uk/api.html).

To import the library into your Google Script, simply add it as a library using the script
ID:

```
1T_JhNQCf8x4PFQyV6RiYmFCTZZyRp1SMtRxrhEoeJNO-Gfpmg6LKpuWW
```

The script exposes a single function called `load` which, when called, will return the various
functions and constants exposed as part of the library.
This is presented in this way to ensure everything maintains the correct scope and to enable
easier testing.

Say, for example, you add the library under the name `PortalLibLoader`.
To load the library you simply need to:

```javascript
const PortalLib = PortalLibLoader.load();
```

at the start of your script and then use the `PortalLib` to use the various functions and
constants in the library.

### Constants

#### SPECIMENS
The resource ID for the [specimen collection resource](https://data.nhm.ac.uk/dataset/56e711e6-c847-4f99-915a-6894bb5c5dea/resource/05ff2255-c38a-40c9-b657-4ccb55ab2feb).

#### INDEX_LOTS
The resource ID for the [index lot resource](https://data.nhm.ac.uk/dataset/9dfb777e-2296-4800-a053-b1c80fd30bac/resource/bb909597-dedf-427d-8c04-4c02b3a24db3).

#### ARTEFACTS
The resource ID for the [artefact resource](https://data.nhm.ac.uk/dataset/e5c45fa4-fd4f-4de7-be32-70f82fead089/resource/ec61d82a-748d-4b53-8e99-3e708e76bc4d).


### Classes

#### SearchError
Exception class that wraps errors from the Data Portal API.


### Functions

#### search
Performs a search on the Data Portal multisearch API and returns the result.
If any errors occur they are raised as a SearchError.

#### count
Performs a count on the Data Portal multisearch API and returns the result.
If any errors occur they are raised as a SearchError.

#### searchAll
Generator function which searches the Portal and yields all of the records it finds.
The records are retrieved using the after parameter in chunks and are seamlessly
yielded to the caller.

#### stringEquals
Convenience function which creates a string_equals block for inclusion in searches/counts
filter blocks.

#### stringContains
Convenience function which creates a string_contains block for inclusion in searches/counts
filter blocks.


## Script Management and Deployment
To manage the scripts in this repository you will need to use [clasp](https://www.npmjs.com/package/@google/clasp).
You can install `clasp` by running:

```bash
npm install -g @google/clasp
```

then run `clasp login` to authenticate yourself with Google.

Before you run any `clasp` commands, you should `cd` into the `src` diretory.

The `clasp` docs cover usage in more detail, but the most common commands you'll need are:

- `clasp pull` - to pull the latest code from Google Script
- `clasp push` - to push the latest local code to Google Script

Be careful about how you use these in case anyone has made changes on one side of the
connection without altering the other.
