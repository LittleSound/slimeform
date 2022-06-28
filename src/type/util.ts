export type BaseType =
| null
| undefined
| string
| number
| boolean
| symbol
| bigint

export type OnCleanup = (cleanupFn: () => void) => void
