import * as fse from 'fs-extra';

export interface IWordLookerUpperInitOptions
{
    alphabeticalDictionaryFile: string;
    wordFrequencyDictionaryFile: string;
}
export class WordLookerUpper
{
    freqSortedWordList: string[];
    alphabeticallySortedWordList: string[];
    firstLetterIndices: Map<string, number>;
    wordSet: Set<string>;
    blacklist: Set<string>;
    whitelist: Set<string>;

    constructor( initOptions: IWordLookerUpperInitOptions )
    {
        this.alphabeticallySortedWordList = fse.readFileSync( initOptions.alphabeticalDictionaryFile ).toString().split( '\n' );
        this.freqSortedWordList = fse.readFileSync( initOptions.wordFrequencyDictionaryFile ).toString().split( '\r\n' );
        this.firstLetterIndices = this.findFirstLetterIndices( this.alphabeticallySortedWordList );
        this.wordSet = new Set( this.freqSortedWordList );
        this.blacklist = new Set();
        this.whitelist = new Set();
    }

    private indexToLetter( i: number ): string
    {
        // a is 0, z is 25
        return ( i + 10 ).toString( 36 );
    }

    private letterToIndex( letter: string ): number
    {
        const asciiIndex = letter.charCodeAt( 0 );
        return asciiIndex - 97;
    }

    private findFirstLetterIndices( wordList: string[] ): Map<string, number>
    {
        let letterStartingIndices = new Map<string, number>();

        const wordListLength = wordList.length;
        for ( let letterIndex = 0; letterIndex < 26; letterIndex++ )
        {
            const letter = this.indexToLetter( letterIndex );

            const startingIndex = letterIndex === 0 ? 0 : letterStartingIndices[this.indexToLetter( letterIndex - 1 )];
            for ( let i = startingIndex; i < wordListLength; i++ )
            {
                const firstLetter = wordList[i][0];
                if ( firstLetter === letter )
                {
                    letterStartingIndices[letter] = i;
                    break;
                }
            }
        }

        return letterStartingIndices;
    }

    getBlacklist(): string[]
    {
        return Array.from( this.blacklist );
    }

    getWhitelist(): string[]
    {
        return Array.from( this.whitelist );
    }

    isBlacklisted( testWord: string ): boolean
    {
        return this.blacklist.has( testWord );
    }

    isWhitelisted( testWord: string ): boolean
    {
        return this.whitelist.has( testWord );
    }

    blacklistWord( word: string )
    {
        if ( this.whitelist.has( word ) )
            this.whitelist.delete( word );
        else
            this.blacklist.add( word )
    }

    whitelistWord( word: string )
    {
        if ( this.blacklist.has( word ) )
            this.blacklist.delete( word );

        if ( this.wordSet.has( word ) )
            return; // Not allowed to whitelist a word that's already in the dictionary
        else
            this.whitelist.add( word );
    }

    isWord( testWord: string ): boolean
    {
        return ( this.wordSet.has( testWord ) || this.isWhitelisted( testWord ) ) && !this.isBlacklisted( testWord );
    }

    getAllWordsStartingWith( wordPart: string ): string[]
    {
        let wordsStartingWithWordPart: string[] = [];
        if ( wordPart.length === 0 )
            return wordsStartingWithWordPart;

        const { startOfThisAlphabetSection, startOfNextAlphabetSection } = this.getAlphabetSubsectionLimitIndices( wordPart );

        let foundOne = false;
        console.log( `First letter is ${wordPart[0]}, so in index range [${startOfThisAlphabetSection}, ${startOfNextAlphabetSection}]` )
        for ( let i = startOfThisAlphabetSection; i < startOfNextAlphabetSection; i++ )
        {
            const word = this.alphabeticallySortedWordList[i];
            if ( word.startsWith( wordPart ) )
            {
                foundOne = true;
                wordsStartingWithWordPart.push( word );
            }
            else if ( foundOne )
            {
                // We have found all possible words that start with this wordPart, no need to keep looking.
                break;
            }
        }

        console.log( `Found ${wordsStartingWithWordPart.length} words starting with "${wordPart}"` );
        return wordsStartingWithWordPart;
    }

    getAllWordsEndingWith( wordPart: string ): string[]
    {
        let wordsEndingWithWordPart: string[] = [];
        if ( wordPart.length === 0 )
            return wordsEndingWithWordPart;

        console.log( `Searching entire dictionary for words that end with "${wordPart}"` )
        for ( let i = 0; i < this.alphabeticallySortedWordList.length; i++ )
        {
            const word = this.alphabeticallySortedWordList[i];
            if ( word.endsWith( wordPart ) )
                wordsEndingWithWordPart.push( word );
        }

        console.log( `Found ${wordsEndingWithWordPart.length} words ending with "${wordPart}"` );
        return wordsEndingWithWordPart;
    }

    getAllWordsContaining( wordPart: string ): string[]
    {
        let wordsContainingWordPart: string[] = [];
        if ( wordPart.length === 0 )
            return wordsContainingWordPart;

        console.log( `Searching entire dictionary for words that contain "${wordPart}"` )
        for ( let i = 0; i < this.alphabeticallySortedWordList.length; i++ )
        {
            const word = this.alphabeticallySortedWordList[i];
            if ( word.length !== wordPart.length && word.includes( wordPart ) )
                wordsContainingWordPart.push( word );
        }

        console.log( `Found ${wordsContainingWordPart.length} words containing "${wordPart}"` );
        return wordsContainingWordPart;
    }

    private getAlphabetSubsectionLimitIndices( wordPart: string )
    {
        const firstLetter = wordPart[0];
        const nextLetter = this.indexToLetter( this.letterToIndex( firstLetter ) + 1 );
        const startOfThisAlphabetSection: number = firstLetter === 'a' ? 0 : this.firstLetterIndices[firstLetter];
        const startOfNextAlphabetSection: number = firstLetter === 'z' ? this.alphabeticallySortedWordList.length : this.firstLetterIndices[nextLetter];
        return { startOfThisAlphabetSection, startOfNextAlphabetSection };
    }

    countWordsEndingWith( wordPart: string ): number
    {
        return this.getAllWordsEndingWith( wordPart ).length;
    }

    countWordsStartingWith( wordPart: string ): number
    {
        return this.getAllWordsStartingWith( wordPart ).length;
    }

    countWordsContaining( wordPart: string ): number
    {
        return this.getAllWordsContaining( wordPart ).length;
    }

    clearBlacklist()
    {
        this.blacklist.clear();
    }

    clearWhitelist()
    {
        this.whitelist.clear();
    }
}
