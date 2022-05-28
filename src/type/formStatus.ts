import type { IgnoredUpdater } from '@vueuse/shared'

export interface StatusItem {
  isError: boolean
  /** Error message */
  message: string
  /** Field is modified */
  isDirty: boolean
  /** Manual verify */
  verify: () => boolean
  init: () => void
  setError: (message: string, isError?: boolean) => void
  clearError: () => void

  _ignoreUpdate: IgnoredUpdater
}

export type FormStatus<FormT extends {}> = {
  readonly [K in keyof FormT]: StatusItem
}
