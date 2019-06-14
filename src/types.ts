export type OnWord = (word: string) => void|string
export type ListBuilder = (onWord: OnWord) => Promise<void>

export type LengthStats = {
  totalWords: number
  shortestWord: number
  longestWord: number
  byLength: {[length: number]: number}
}

export type LengthMap = Map<number, string[]>
export type ReadonlyLengthMap = Readonly<{[length: number]: readonly string[]}>

export type ReadonlyResult = {
  stats: LengthStats
  words: ReadonlyLengthMap
}
