#!/usr/bin/env node
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { WordLookerUpper } from './wordLookerUpper';

const initOptions = {
    alphabeticalDictionaryFile: './resources/sorted_dictionary.txt',
    wordFrequencyDictionaryFile: './resources/20k_word_freq_dict.txt',
    userBlacklistDictionaryFile: './resources/blacklist.txt',
    userWhitelistDictionaryFile: './resources/whitelist.txt'
}
const wordLookerUpper = new WordLookerUpper(initOptions);

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json('Server online');
});

app.get('/isword/:testWord', (req, res) => {
    console.log(`isword/${req.params.testWord}`);
    const testWord = req.params.testWord;
    res.json({
        isWord: wordLookerUpper.isWord(testWord)
    });
});

app.get('/isblacklisted/:word', (req, res) => {
    res.json({
        isBlacklisted: wordLookerUpper.isBlacklisted(req.params.word)
    });
});

app.get('/iswhitelisted/:word', (req, res) => {
    res.json({
        isWhitelisted: wordLookerUpper.isWhitelisted(req.params.word)
    });
});

app.get('/blacklist', (req, res) => {
    res.json(wordLookerUpper.getBlacklist());
});

app.get('/whitelist', (req, res) => {
    res.json(wordLookerUpper.getWhitelist());
})

app.get('/possiblewords/:wordPart', (req, res) => {
    console.log(`possiblewords/${req.params.wordPart}`);
    res.json(wordLookerUpper.getPossibleWords(req.params.wordPart));
});

app.post('/blacklist/:word', (req, res) => {
    console.log(`/blacklistword/${req.params.word}`);
    wordLookerUpper.blacklistWord(req.params.word);
    res.status(200);
});

app.post('/whitelist/:word', (req, res) => {
    console.log(`/whitelistword/${req.params.word}`);
    wordLookerUpper.whitelistWord(req.params.word);
    res.status(200);
});

// Turn on the server
// let portToUse = process.env.PORT || 3000; // env var used by Heroku, ifndef then use port 3000
let portToUse = 3001;
app.listen(portToUse, () => {
    console.log(`Server is running on port ${portToUse}`);
});