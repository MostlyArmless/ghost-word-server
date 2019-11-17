import * as fs from 'fs';

export interface IWordLookerUpperInitOptions {
    alphabeticalDictionaryFile: string;
    wordFrequencyDictionaryFile: string;
    userBlacklistDictionaryFile: string;
    userWhitelistDictionaryFile: string;
}
export class WordLookerUpper {
    freqSortedWordList: string[];
    alphabeticallySortedWordList: string[];
    firstLetterIndices: Map<string, number>;
    wordSet: Set<string>;
    blacklist: Set<string>;
    whitelist: Set<string>;

    constructor(initOptions: IWordLookerUpperInitOptions) {
        this.alphabeticallySortedWordList = fs.readFileSync(initOptions.alphabeticalDictionaryFile).toString().split('\n');
        this.freqSortedWordList = fs.readFileSync(initOptions.wordFrequencyDictionaryFile).toString().split('\r\n');
        this.firstLetterIndices = this.findFirstLetterIndices(this.alphabeticallySortedWordList);
        this.wordSet = new Set(this.freqSortedWordList);
        this.blacklist = new Set(fs.readFileSync(initOptions.userBlacklistDictionaryFile).toString().split('/r/n'));
        this.whitelist = new Set(fs.readFileSync(initOptions.userWhitelistDictionaryFile).toString().split('/r/n'));
    }

    private indexToLetter(i: number): string {
        // a is 0, z is 25
        return (i + 10).toString(36);
    }

    private letterToIndex(letter: string): number {
        const asciiIndex = letter.charCodeAt(0);
        return asciiIndex - 97;
    }

    private findFirstLetterIndices(wordList: string[]): Map<string, number> {
        let letterStartingIndices = new Map<string, number>();

        const wordListLength = wordList.length;
        for (let letterIndex = 0; letterIndex < 26; letterIndex++) {
            const letter = this.indexToLetter(letterIndex);

            const startingIndex = letterIndex === 0 ? 0 : letterStartingIndices[this.indexToLetter(letterIndex - 1)];
            for (let i = startingIndex; i < wordListLength; i++) {
                const firstLetter = wordList[i][0];
                if (firstLetter === letter) {
                    letterStartingIndices[letter] = i;
                    break;
                }
            }
        }

        return letterStartingIndices;
    }

    getBlacklist(): string[] {
        return Array.from(this.blacklist);
    }

    getWhitelist(): string[] {
        return Array.from(this.whitelist);
    }

    isBlacklisted(testWord: string): boolean {
        return this.blacklist.has(testWord);
    }

    isWhitelisted(testWord: string): boolean {
        return this.whitelist.has(testWord);
    }

    blacklistWord(word: string) {
        if (this.whitelist.has(word))
            this.whitelist.delete(word);
        else
            this.blacklist.add(word)
    }

    whitelistWord(word: string) {
        if (this.wordSet.has(word)) {
            if (this.blacklist.has(word)) {
                this.blacklist.delete(word);
                return;
            }
            return; // Not allowed to whitelist a word that's already in the dictionary
        }
        else {
            if (this.blacklist.has(word)) {
                this.blacklist.delete(word);
            }
            this.whitelist.add(word);
        }
    }

    isWord(testWord: string): boolean {
        return (this.wordSet.has(testWord) || this.isWhitelisted(testWord)) && !this.isBlacklisted(testWord);
    }

    getPossibleWords(wordPart: string): string[] {
        let wordsStartingWithWordPart: string[] = [];
        const firstLetter = wordPart[0];
        const nextLetter = this.indexToLetter(this.letterToIndex(firstLetter) + 1);
        const startOfThisAlphabetSection: number = firstLetter === 'a' ? 0 : this.firstLetterIndices[firstLetter];
        const startOfNextAlphabetSection: number = firstLetter === 'z' ? this.alphabeticallySortedWordList.length : this.firstLetterIndices[nextLetter];

        let foundOne = false;
        console.log(`First letter ${firstLetter}, so in index range [${startOfThisAlphabetSection}, ${startOfNextAlphabetSection}]`)
        for (let i = startOfThisAlphabetSection; i < startOfNextAlphabetSection; i++) {
            const word = this.alphabeticallySortedWordList[i];
            if (word.startsWith(wordPart)) {
                foundOne = true;
                wordsStartingWithWordPart.push(word);
            }
            else if (foundOne) {
                // We have found all possible words that start with this wordPart, no need to keep looking.
                break;
            }
        }

        return wordsStartingWithWordPart;
    }
}
