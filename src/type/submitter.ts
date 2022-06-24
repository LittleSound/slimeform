import type { Ref } from 'vue'
import type { UseFormReturn } from './form'

export type SubmitFunction<FormT = any, FnReturnT = any> = (formData: UseFormReturn<FormT>) => FnReturnT

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
