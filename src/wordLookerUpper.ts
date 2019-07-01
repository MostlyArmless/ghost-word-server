import * as fs from 'fs';

export class WordLookerUpper {
    freqSortedWordList: string[];
    alphabeticallySortedWordList: string[];
    firstLetterIndices: Map<string, number>;
    wordSet: Set<string>;

    constructor(alphabeticalDictionaryFile: string, wordFrequencyDictionaryFile: string) {
        this.alphabeticallySortedWordList = fs.readFileSync(alphabeticalDictionaryFile).toString().split('\n');
        this.freqSortedWordList = fs.readFileSync(wordFrequencyDictionaryFile).toString().split('\r\n');
        this.firstLetterIndices = this.findFirstLetterIndices(this.alphabeticallySortedWordList);
        this.wordSet = new Set(this.freqSortedWordList);
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

    isWord(testWord: string): boolean {
        return this.wordSet.has(testWord);
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
