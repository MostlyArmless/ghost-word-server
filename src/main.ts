#!/usr/bin/env node
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { WordLookerUpper } from './wordLookerUpper';

const wordLookerUpper = new WordLookerUpper(
    './resources/sorted_dictionary.txt',
    './resources/20k_word_freq_dict.txt'
);

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

app.get('/possiblewords/:wordPart', (req, res) => {
    console.log(`possiblewords/${req.params.wordPart}`);
    res.json(wordLookerUpper.getPossibleWords(req.params.wordPart));
});



// Turn on the server
// let portToUse = process.env.PORT || 3000; // env var used by Heroku, ifndef then use port 3000
let portToUse = 3001;
app.listen(portToUse, () => {
    console.log(`Server is running on port ${portToUse}`);
});