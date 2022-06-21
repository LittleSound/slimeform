import { isPromise } from 'util/types'
import type { Ref } from 'vue'
import { ref } from 'vue'
import type { UseFormReturn } from './type/form'
import { invoke } from './util/invoke'

type SubmitFunction<FormT, FnReturnT = any> = (formData: UseFormReturn<FormT>) => FnReturnT

interface CreateSubmitReturn<FnT> {
  submit: FnT
  submitting: Ref<boolean>
}

export function createSubmit<FormT extends {}, FnT extends SubmitFunction<FormT>>(
  formData: UseFormReturn<FormT>,
  fn: FnT,
): CreateSubmitReturn<FnT> {
  const submitting = ref(false)

  const submitFn = ((formData) => {
    const ret = fn(formData)
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
  }) as FnT

  return {
    submitting,
    submit: submitFn,
  }
}
