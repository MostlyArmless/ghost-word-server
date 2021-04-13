// Use this script to take the dictionary file that is sorted by word frequency and resort it alphabetically.
// This should be a one-time setup step.

const fs = require( 'fs' );

const words = fs.readFileSync( '../resources/20k_word_freq_dict.txt' ).toString().split( '\r\n' );

console.log( 'sorting...' );
const wordsSorted = words.sort().join( '\n' );
console.log( 'writing...' );
fs.writeFileSync( '../resources/sorted_dictionary.txt', wordsSorted );
console.log( 'Done' );