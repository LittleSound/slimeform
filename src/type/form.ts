import type { ComputedRef, DeepReadonly, UnwrapNestedRefs } from 'vue'
import type { FormStatus } from './formStatus'

export type RuleItem<ValueT = any> = ((val: ValueT) => boolean | string)

export type UseFormBuilder<Form extends {} = {}> = () => Form
export type UseFormRule<FormT extends {}> = {
  readonly [K in keyof FormT]?: RuleItem<FormT[K]> | RuleItem<FormT[K]>[]
}
export type UseFormDefaultMessage = string

export interface UseFormReturn<FormT> {
  /* state */

  /** form object */
  form: UnwrapNestedRefs<FormT>
  /** Form status */
  status: FormStatus<FormT>

  /* getter */

  /** A object that only contains the modified `form` fields */
  dirtyFields: ComputedRef<DeepReadonly<UnwrapNestedRefs<Partial<FormT>>>>
  /** Whether any of form fields contain an errored validation result */
  isError: ComputedRef<boolean>

  /* actions */

  /** Manual verify */
  verify: () => boolean
  /** Clear all errors */
  clearErrors: () => void
  /** Reset form  */
  reset: () => void

  /**
   * Submit form
   * Verify before submitting, and execute callback if passed
   */
  onSubmit: (callback: () => unknown) => unknown
}
