import type { ComputedRef, DeepReadonly, UnwrapNestedRefs } from 'vue'
import type { FormStatus } from './formStatus'
import type { OnCleanup } from './util'

export type RuleItem<ValueT = any> = (val: ValueT, onCleanup?: OnCleanup) => boolean | string | Promise<boolean | string>

export type UseFormBuilder<Form extends {} = {}> = () => Form
export type UseFormRule<FormT extends {}> = {
  readonly [K in keyof FormT]?: RuleItem<FormT[K]> | RuleItem<FormT[K]>[]
}
export type UseFormDefaultMessage = string

export interface UseFormParam<FormT> {
  /** Initial form value */
  form: UseFormBuilder<FormT>
  /** Verification rules */
  rule?: UseFormRule<FormT>
  /** Default error message */
  defaultMessage?: UseFormDefaultMessage
}

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

  /**
   * Reset form to initial value
   * @param fields If not specified, all form fields will be reset
   */
  reset: (...fields: (keyof FormT)[]) => void

  /**
   * Submit form
   * Verify before submitting, and execute callback if passed
   */
  onSubmit: (callback: () => unknown) => unknown
}
