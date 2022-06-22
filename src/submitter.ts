import { isPromise } from 'util/types'
import type { Ref } from 'vue'
import { ref } from 'vue'
import type { UseFormReturn } from './type/form'
import { invoke } from './util/invoke'

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
  submit: SubmitFunction<Parameters<FnT>, ReturnType<FnT> | undefined>
  submitting: Ref<boolean>
}

export function createSubmit<FormT extends {}, FnT extends SubmitFunction<FormT>>(
  formData: UseFormReturn<FormT>,
  fn: FnT,
  options?: CreateSubmitOptions,
): CreateSubmitReturn<FnT> {
  const {
    enableVerify = true,
  } = options ?? {}

  const { verify } = formData

  const submitting = ref(false)

  const submitFn = ((formData) => {
    if (enableVerify && !verify())
      return

    const ret = fn(formData as any)
    // 如果是异步的，则创建一个异步函数并返回它，然后在创建的异步函数中等待结果，并变更 submitting 的状态
    // 否则，是同步的则直接返回结果
    if (isPromise(ret)) {
      return invoke(async () => {
        submitting.value = true
        try {
          return await ret
        }
        finally {
          submitting.value = false
        }
      })
    }
    else {
      return ret
    }
  }) as CreateSubmitReturn<FnT>['submit']

  return {
    submitting,
    submit: submitFn,
  }
}
