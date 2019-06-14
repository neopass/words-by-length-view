# words-by-length-view

Organizes a word list by the length of the words.

For a source word list, see [@neopass/wordlist](https://www.npmjs.com/package/@neopass/wordlist)

```javascript
import { WordsByLengthView } from '@neopass/words-by-length-view'

// Use a set to avoid duplicate words.
let words = new Set([
  'some', 'words', 'in', 'a', 'list',
  'to', 'be', 'organized', 'by', 'length', 'by', 'the', 'view',
  'this', 'can', 'also', 'be', 'a', 'promise', 'that', 'returns', 'a', 'list',
  'or', 'a', 'wordlist', 'list', 'builder', 'function',
])

// Create the view, converting the set to an array.
const view = new WordsByLengthView([...words])

// Allow the set to be garbage collected.
words = null

// Get all words by length.
const allWords = view.get()
console.log(allWords)

// Get words of length from 3 to 6, inclusive.
const someWords = view.get(3, 6)
console.log(someWords)
```

All words output:

```javascript
{
  words: {
    '1': [ 'a' ],
    '2': [ 'in', 'to', 'be', 'by', 'or' ],
    '3': [ 'the', 'can' ],
    '4': [ 'some', 'list', 'view', 'this', 'also', 'that' ],
    '5': [ 'words' ],
    '6': [ 'length' ],
    '7': [ 'promise', 'returns', 'builder' ],
    '8': [ 'wordlist', 'function' ],
    '9': [ 'organized' ]
  },
  stats: {
    totalWords: 22,
    shortestWord: 1,
    longestWord: 9,
    byLength: {
      '1': 1,
      '2': 5,
      '3': 2,
      '4': 6,
      '5': 1,
      '6': 1,
      '7': 3,
      '8': 2,
      '9': 1
    }
  }
}
```

Some words output:

```javascript
{
  words: {
    '3': [ 'the', 'can' ],
    '4': [ 'some', 'list', 'view', 'this', 'also', 'that' ],
    '5': [ 'words' ],
    '6': [ 'length' ]
  },
  stats: {
    totalWords: 10,
    shortestWord: 3,
    longestWord: 6,
    byLength: {
      '3': 2, '4': 6, '5': 1, '6': 1
    }
  }
}
```
