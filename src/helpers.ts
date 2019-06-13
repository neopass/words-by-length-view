import { LengthMap, ReadonlyLengthMap, ListBuilder, OnWord, LengthStats } from './types'

const MAX_INT = Number.MAX_SAFE_INTEGER

/**
 * Update a map object by adding the given word to its word list.
 */
export function addByLength(map: LengthMap, word: string): void {
  const list = map.get(word.length) || []
  list.push(word)
  map.set(word.length, list)
}

/**
 * Add words to the map using a list builder.
 */
export function fromBuilder(map: LengthMap, builder: ListBuilder, onWord?: OnWord): Promise<void> {
  // If onWord is specified, use it to determine which words get added.
  if (typeof onWord === 'function') {
   return builder((word) => {
      const _word = onWord(word)
      if (typeof _word === 'string' && _word.length > 0) {
        addByLength(map, _word)
      }
    })
  }

  // No onWord specified, just run the builder.
  return builder(addByLength.bind(null, map))
}

/**
 * Convert a PromiseLike value into a Promise.
 */
export function toPromise<T>(value: PromiseLike<T>): Promise<T> {
  return new Promise((resolve) =>  value.then(resolve))
}

/**
 * Convert a length map to a ReadonlyLengthMap.
 */
export function toReadonlyLengthMap(map: LengthMap, min: number, max: number): ReadonlyLengthMap {
  // Create an array from the map's entries.
  const entries = [...map.entries()]

  // Sort the entries.
  entries.sort(([a],  [b]) => a - b)

  // Create a readonly object from the given map.
  const readonlyLengthMap = entries.reduce((_map, [length, list]) => {
    if (length >= min && length <= max) {
      _map[length] = Object.freeze(list)
    }
    return _map
  }, {} as {[key: number]: readonly string[]})

  return Object.freeze(readonlyLengthMap) as ReadonlyLengthMap
}

/**
 * Generate a length stats object.
 */
export function byLengthStats(map: LengthMap): LengthStats {
  let totalWords = 0
  let shortestWord = MAX_INT
  let longestWord = 0

  // Get the entries from the map.
  const entries = [...map.entries()]

  // Build a map of { word length => number of words }.
  const byLength = entries.reduce((map, entry) => {
    const [wordLength, wordList] = entry
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
