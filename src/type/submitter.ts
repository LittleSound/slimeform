import type { Ref } from 'vue'
import type { UseFormReturn } from './form'

export type SubmitFunction<FormT = any, FnReturnT = any> = (formData: Omit<UseFormReturn<FormT>, 'submitter'>) => FnReturnT

export type Submitter<FormT extends {}> = <FnT extends SubmitFunction<FormT>>(
  fn: FnT,
  options?: CreateSubmitOptions,
) => CreateSubmitReturn<FnT>

export interface CreateSubmitOptions {
  /**
   * ## Enable Verification
   * Check validation before committing and skip the commit process if it fails
   * @default true
   */
  enableVerify?: boolean
}

export interface CreateSubmitReturn<FnT extends SubmitFunction<any>> {
  submit: () => ReturnType<FnT> | undefined
  submitting: Ref<boolean>
}
