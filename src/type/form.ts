import type { ComputedRef, DeepReadonly, UnwrapNestedRefs } from 'vue'
import type { FormStatus } from './formStatus'
import type { Submitter } from './submitter'
import type { UnknownObject } from './util'

export type RuleItem<ValueT = any> = ((val: ValueT) => boolean | string)

export type UseFormBuilder<Form = UnknownObject> = () => Form
export type UseFormRule<FormT = UnknownObject> = {
  readonly [K in keyof FormT]?: RuleItem<FormT[K]> | RuleItem<FormT[K]>[]
}
export type UseFormDefaultMessage = string
export type UseFormLazy = boolean

export interface UseFormParam<FormT> {
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
   */
  lazy?: UseFormLazy
  /**
   * Verify all rules even if some rules fail
   * @default false
   */
  fullValidation?: boolean
}

export interface ValidateOptions<FullResult extends boolean> { fullResult?: FullResult }
export interface ValidateResult { valid: boolean, message: string }

export interface UseFormReturnRuleItem {
  validate: ((value: any) => boolean) & ((value: any, options: ValidateOptions<false>) => boolean) & ((value: any, options: ValidateOptions<true>) => ValidateResult)
}
export type UseFormReturnRule<FormT> = Record<keyof UseFormRule<FormT>, UseFormReturnRuleItem>

export interface UseFormReturn<FormT> {
  /* state */

  /** form object */
  form: UnwrapNestedRefs<FormT>
  /** Form status */
  status: FormStatus<FormT>

  rule: UseFormReturnRule<FormT>

  /* getter */

  /** A object that only contains the modified `form` fields */
  dirtyFields: ComputedRef<DeepReadonly<UnwrapNestedRefs<Partial<FormT>>>>
  /** Form is modified */
  isDirty: ComputedRef<boolean>
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
