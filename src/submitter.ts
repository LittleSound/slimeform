import { isPromise } from 'util/types'
import { ref } from 'vue'
import type { UseFormReturn } from './type/form'
import type { CreateSubmitOptions, CreateSubmitReturn, SubmitFunction, Submitter } from './type/submitter'
import { invoke } from './util/invoke'

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

  const submitFn = (() => {
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

export function createSubmitter(formData: () => any): Submitter<any> {
  return (...args: [any]) => createSubmit(formData(), ...args)
}
