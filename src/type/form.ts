import type { ComputedRef, DeepReadonly, UnwrapNestedRefs } from 'vue'
import type { FormStatus } from './formStatus'
import type { Submitter } from './submitter'

export type RuleItem<ValueT = unknown, FormT = unknown> = ((val: ValueT, full: DeepReadonly<FormT>) => boolean | string)

export type UseFormBuilder<Form extends object> = () => Form
export type UseFormRule<FormT> = {
  readonly [K in keyof FormT]?: RuleItem<FormT[K], FormT> | RuleItem<FormT[K], FormT>[]
}
export type UseFormDefaultMessage = string
export type UseFormLazy = boolean

export interface UseFormParam<FormT extends object> {
  /** Initial form value */
  form: UseFormBuilder<FormT>
  /** Verification rules */
  rule?: UseFormRule<FormT>
  /** Default error message */
  defaultMessage?: UseFormDefaultMessage
  /**
   * Prevent rules from being automatically verified when data changes,
   * Unless `verify()` or `status[fieldName].verify()` is called manually to validate the rule.
   *
   * @default false
   * */
  lazy?: UseFormLazy
}

export interface UseFormReturn<FormT extends object> {
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
   * @deprecated use `submitter` instead of it
   */
  onSubmit: (callback: () => unknown) => unknown

  /**
   * Define a submit function
   * Returns the wrapped commit function and status variables
   * Verify before submitting, and execute callback if passed
   */
  submitter: Submitter<FormT>
}
