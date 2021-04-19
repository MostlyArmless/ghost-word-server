# ghost-word-server
This package is the backend for the [ghost-js](https://github.com/MostlyArmless/ghost-js) project. It fulfills requests to check if a word exists and to see what possible words can be constructed based on a given string.

## Installation
`npm install` to install the dependencies

## Usage
`npm start` to run the server.
> Note: Currently the whitelist/blacklist are stored in-memory only, so if you restart the server you'll lose your custom dictionary (whitelist) and blacklist.