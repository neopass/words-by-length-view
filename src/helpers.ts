import { LengthMap, ReadonlyLengthMap, ListBuilder, OnWord, LengthStats } from './types'

const MAX_INT = Number.MAX_SAFE_INTEGER

/**
 * Update a map object by adding the given word to its word list.
 */
export function addByLength(map: LengthMap, word: string): void {
  const list = map[word.length] || []
  list.push(word)
  map[word.length] = list
}

/**
 * Sort a map's lists and return a new object with keys sorted by length.
 */
export function sortedMap(map: LengthMap): LengthMap {
  const entries = Object.entries(map)
  entries.sort((a, b) => Number(a[0]) - Number(b[0]))

  const _map = entries.reduce((m, entry) => {
    const [length, wordList] = entry
    const wordLength = Number(length)
    wordList.sort()
    m[wordLength] = wordList
    return m
  }, {} as LengthMap)

  return _map
}

/**
 * Freeze a map and all its lists.
 */
export function freezeMap(map: LengthMap): ReadonlyLengthMap {
  map = Object.freeze(map)
  Object.keys(map).forEach(key => Object.freeze(map[Number(key)]))
  return map
}

/**
 * Add words to the map using a list builder.
 */
export function fromBuilder(map: LengthMap, builder: ListBuilder, onWord?: OnWord): Promise<void> {
  if (typeof onWord === 'function') {
   return builder((word) => {
      const _word = onWord(word)
      if (typeof _word === 'string') {
        addByLength(map, _word)
      }
    })
  }

  return builder(addByLength.bind(null, map))
}

/**
 * Convert a PromiseLike value into a Promise.
 */
export function toPromise<T>(value: PromiseLike<T>): Promise<T> {
  return new Promise((resolve) =>  value.then(resolve))
}

/**
 * Generate a length stats object.
 */
export function byLengthStats(map: ReadonlyLengthMap): LengthStats {
  let totalWords = 0
  let shortestWord = MAX_INT
  let longestWord = 0

  // Build a map of { word length => number of words }.
  const entries = Object.entries(map)
  const byLength = entries.reduce((map, entry) => {
    const [length, wordList] = entry
    const wordLength = Number(length)
    map[wordLength] = wordList.length

    totalWords += wordList.length
    shortestWord = Math.min(shortestWord, wordLength)
    longestWord = Math.max(longestWord, wordLength)
    return map
  }, {} as {[key: number]: number})

  // If the shortest equals MAX, we didn't process any words.
  if (shortestWord === MAX_INT) { shortestWord = 0 }

  return { totalWords, shortestWord, longestWord, byLength }
}
