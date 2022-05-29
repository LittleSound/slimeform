import type { ComputedRef, UnwrapNestedRefs } from 'vue'
import type { FormStatus } from './formStatus'

export type RuleItem<ValueT = any> = ((val: ValueT) => boolean | string)

export type UseFormBuilder<Form extends {} = {}> = () => Form
export type UseFormRule<FormT extends {}> = {
  readonly [K in keyof FormT]?: RuleItem<FormT[K]> | RuleItem<FormT[K]>[]
}

export interface UseFormReturn<FormT> {
  /** form object */
  form: UnwrapNestedRefs<FormT>
  /** Form status */
  status: FormStatus<FormT>

  dirtyFields: ComputedRef<Partial<FormT>>

  /** Manual verify */
  verify: () => boolean
  clearErrors: () => void
  /** Reset form  */
  reset: () => void

  /**
   * Submit form
   * Verify before submitting, and execute callback if passed
   */
  onSubmit: (callback: () => unknown) => unknown
}
