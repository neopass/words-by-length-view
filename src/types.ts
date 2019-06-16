export type OnWord = (word: string) => void|string
export type ListBuilder = (onWord: OnWord) => Promise<void>

export interface LengthStats {
  readonly totalWords: number
  readonly shortestWord: number
  readonly longestWord: number
  byLength: Readonly<{[length: number]: number}>
}

export type LengthMap = Map<number, string[]>
export type ReadonlyLengthMap = Readonly<{[length: number]: readonly string[]}>

export interface ByLengthResult {
  stats: LengthStats
  words: ReadonlyLengthMap
}
