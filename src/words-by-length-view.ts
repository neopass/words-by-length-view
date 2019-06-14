import {
  ReadonlyLengthMap,
  LengthStats,
  ListBuilder,
  OnWord,
  LengthMap,
  ByLengthResult,
} from './types'

import {
  addByLength,
  fromBuilder,
  byLengthStats,
  toPromise,
  toReadonlyLengthMap,
} from './helpers'

import { MAX_INT } from './constants'

type ConstructorValue = string[]|ListBuilder|PromiseLike<string[]>

/**
 *
 */
export class WordsByLengthView {
  private _byLengthMap: LengthMap
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
   * @param builder a list builder function
   * @param onWord an optional word processing function
   */
  constructor(builder: ListBuilder, onWord?: OnWord)
  /**
   * Construct the view.
   */
  constructor(value: ConstructorValue, onWord?: OnWord) {
    // Assign a temporary value to the member variable.
    this._byLengthMap = new Map()

    // Create an alias function bound to the length map.
    const _addByLength = addByLength.bind(null, this._byLengthMap)

    // Build map synchronously (string[]).
    if (Array.isArray(value)) {
      value.forEach(_addByLength)
      this._promise = Promise.resolve()

    // Build map asynchronously (ListBuilder).
    } else if (typeof value === 'function') {
      this._promise = fromBuilder(this._byLengthMap, value, onWord)

    // Build map asynchronously (PromiseLike<string[]>).
    } else {
      this._promise = toPromise(value)
        .then(list => list.forEach(_addByLength))
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
  get(): ByLengthResult
  /**
   * Return all words of the given length.
   */
  get(length: number): ByLengthResult
  /**
   * Return words of length [min, max].
   */
  get(min: number, max: number): ByLengthResult
  /**
   * Overload handler.
   */
  get(min?: number, max?: number): ByLengthResult {
    let map: ReadonlyLengthMap

    // Handle no arguments overload.
    if (typeof min !== 'number') {
      // Return the entire map.
      map = toReadonlyLengthMap(this._byLengthMap, 1, MAX_INT)

    // Handle length overload.
    } else if (typeof max !== 'number') {
      // Return items matching min.
      map = toReadonlyLengthMap(this._byLengthMap, min, min)

    // Handle min/max overload.
    } else {
      // Return items between min and max, inclusive.
      map = toReadonlyLengthMap(this._byLengthMap, min, max)
    }

    const stats = byLengthStats(map)
    return { stats, words: map }
  }

  /**
   *
   */
  stats(): LengthStats {
    const map = toReadonlyLengthMap(this._byLengthMap, 1, MAX_INT)
    return byLengthStats(map)
  }
}
