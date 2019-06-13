import {
  ReadonlyLengthMap,
  LengthStats,
  ListBuilder,
  OnWord,
  LengthMap
} from './types'

import {
  addByLength,
  sortedMap,
  freezeMap,
  fromBuilder,
  byLengthStats,
  toPromise
} from './helpers'

type ConstructorValue = string[]|ListBuilder|PromiseLike<string[]>

/**
 *
 */
export class WordsByLengthView {
  private _byLengthMap: ReadonlyLengthMap
  private _promise: Promise<void>

  /**
   * Construct the view from a list of words.
   */
  constructor(words: string[])
  /**
   * Construct the view from a promise that resolves to a list of words.
   */
  constructor(promise: PromiseLike<string[]>)
  /**
   * Construct the view from a list builder function.
   *
   * @param builder the list builder function
   * @param onWord an optional word processing function
   */
  constructor(builder: ListBuilder, onWord?: OnWord)
  /**
   * Construct the view.
   */
  constructor(value: ConstructorValue, onWord?: OnWord) {
    // Assign a temporary value to the member variable.
    this._byLengthMap = {}
    // Create a non-readonly map to populate.
    const byLengthMap: LengthMap = {}
    // Create an alias function bound to the length map.
    const _addByLength = addByLength.bind(null, byLengthMap)

    // Build map synchronously (string[]).
    if (Array.isArray(value)) {
      value.forEach(_addByLength)
      this._byLengthMap = freezeMap(sortedMap(byLengthMap))
      this._promise = Promise.resolve()

    // Build map asynchronously (ListBuilder).
    } else if (typeof value === 'function') {
      this._promise = fromBuilder(byLengthMap, value, onWord)
        .then(() => {
          this._byLengthMap = freezeMap(sortedMap(byLengthMap))
        })

    // Build map asynchronously (PromiseLike<string[]>).
    } else {
      this._promise = toPromise(value)
        .then(list => list.forEach(_addByLength))
        .then(() => {
          this._byLengthMap = freezeMap(sortedMap(byLengthMap))
        })
    }
  }

  /**
   * Return a promise that resolves when list processing is complete.
   *
   * Use of this function is only strictly necessary when a
   * promise or a ListBuilder function is given to the constructor.
   */
  ready(): Promise<void> {
    return this._promise
  }

  /**
   * Return all words by length.
   */
  get(): ReadonlyLengthMap
  /**
   * Return all words of the given length.
   */
  get(length: number): ReadonlyArray<string>
  /**
   * Return words of length [min, max].
   */
  get(min: number, max: number): ReadonlyLengthMap
  /**
   * Overload handler.
   */
  get(value?: number, max?: number): ReadonlyLengthMap|ReadonlyArray<string> {
    // Handle no arguments overload.
    if (typeof value !== 'number') {
      // Return a copy.
      return this._byLengthMap
    }

    // Handle length overload.
    if (typeof max !== 'number') {
      const length = value
      return this._byLengthMap[length] || Object.freeze([])
    }

    // Handle min, max overload.
    const min = value
    const entries = Object.entries(this._byLengthMap)

    // Create a map of only the keys in [min, max].
    const map = entries.reduce((_map, entry) => {
      const [length, wordList] = entry
      const wordLength = Number(length)
      if (wordLength >= min && wordLength <= max) {
        _map[wordLength] = <string[]>wordList
      }
      return _map
    }, {} as LengthMap)

    return Object.freeze(map)
  }

  /**
   *
   */
  stats(): LengthStats {
    return byLengthStats(this._byLengthMap)
  }
}
