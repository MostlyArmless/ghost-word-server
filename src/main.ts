#!/usr/bin/env node
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { IWordLookerUpperInitOptions, WordLookerUpper } from './wordLookerUpper';

const initOptions: IWordLookerUpperInitOptions = {
    alphabeticalDictionaryFile: './resources/sorted_dictionary.txt',
    wordFrequencyDictionaryFile: './resources/20k_word_freq_dict.txt',
}
const wordLookerUpper = new WordLookerUpper( initOptions );

const app = express();
app.use( bodyParser.json() );
app.use( cors() );

app.get( '/', ( req, res ) =>
{
    res.json( 'Server online' );
} );

app.get( '/isword/:testWord', ( req, res ) =>
{
    console.log( `isword/${req.params.testWord}` );
    const testWord = req.params.testWord;
    res.json( {
        isWord: wordLookerUpper.isWord( testWord )
    } );
} );

app.get( '/isblacklisted/:word', ( req, res ) =>
{
    res.json( {
        isBlacklisted: wordLookerUpper.isBlacklisted( req.params.word )
    } );
} );

app.get( '/iswhitelisted/:word', ( req, res ) =>
{
    res.json( {
        isWhitelisted: wordLookerUpper.isWhitelisted( req.params.word )
    } );
} );

app.get( '/blacklist', ( req, res ) =>
{
    console.log( '/blacklist' );
    res.json( wordLookerUpper.getBlacklist() );
} );

app.get( '/whitelist', ( req, res ) =>
{
    console.log( '/whitelist' );
    res.json( wordLookerUpper.getWhitelist() );
} )

app.get( '/wordsstartingwith/:wordPart', ( req, res ) =>
{
    console.log( `wordsstartingwith/${req.params.wordPart}` );
    res.json( wordLookerUpper.getAllWordsStartingWith( req.params.wordPart ) );
} );

app.get( '/wordsendingwith/:wordPart', ( req, res ) =>
{
    console.log( `wordsendingwith/${req.params.wordPart}` );
    res.json( wordLookerUpper.getAllWordsEndingWith( req.params.wordPart ) );
} );

app.get( '/wordscontaining/:wordPart', ( req, res ) =>
{
    console.log( `wordscontaining/${req.params.wordPart}` );
    res.json( wordLookerUpper.getAllWordsContaining( req.params.wordPart ) );
} );

app.get( '/blacklist/:word', ( req, res ) =>
{
    console.log( `client trying to blacklist word "${req.params.word}"` );
    wordLookerUpper.blacklistWord( req.params.word );
    res.status( 200 );
} );

app.get( '/whitelist/:word', ( req, res ) =>
{
    console.log( `client trying to whitelist word "${req.params.word}"` );
    wordLookerUpper.whitelistWord( req.params.word );
    res.status( 200 );
} );

app.get( '/clearblacklist', ( req, res ) =>
{
    console.log( `Clearing blacklist.` );
    wordLookerUpper.clearBlacklist();
    res.status( 200 );
} );

app.get( '/clearwhitelist', ( req, res ) =>
{
    console.log( `Clearing whitelist.` );
    wordLookerUpper.clearWhitelist();
    res.status( 200 );
} );

// Turn on the server
let portToUse = process.env.PORT || 3001; // Use Heroku's port if in production
app.listen( portToUse, () =>
{
    console.log( `Server is running on port ${portToUse}` );
} );