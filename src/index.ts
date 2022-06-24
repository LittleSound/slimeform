import { reactive, readonly, ref } from 'vue'
import type { Ref, UnwrapNestedRefs } from 'vue'
import { isHasOwn } from './util/is'
import { initStatus } from './defineStatus'
import type { StatusItem } from './type/formStatus'
import type { UseFormBuilder, UseFormDefaultMessage, UseFormReturn, UseFormRule } from './type/form'
import { useDirtyFields, useIsError } from './getters'
import { createSubmitter } from './submitter'

const defaultParam: Required<{ defaultMessage: UseFormDefaultMessage }> = {
  defaultMessage: '',
}

/**
 *  Form state management and rule validation
 * @see https://vueuse.org/useForm
 * @param param Form and Rule object
 * @returns Form and Form Status
 */
export function useForm<FormT extends {}>(param: {
  /** Initial form value */
  form: UseFormBuilder<FormT>
  /** Verification rules */
  rule?: UseFormRule<FormT>
  /** Default error message */
  defaultMessage?: UseFormDefaultMessage
}): UseFormReturn<FormT> {
  const options = Object.assign({}, defaultParam, param)
  const { form: formBuilder, rule: formRule, defaultMessage: formDefaultMessage } = options

  const initialForm = ref(formBuilder()) as Ref<FormT>
  const form = reactive<FormT>(formBuilder())

  const status = reactive({} as Record<PropertyKey, StatusItem>)
  initStatus<FormT>(status, form, initialForm, formDefaultMessage, formRule)

  const formData: UseFormReturn<FormT> = {
    form,
    status: readonly(status) as any,
    dirtyFields: useDirtyFields(form, status),
    isError: useIsError(status),
    submitter: createSubmitter(() => formData),
    ...createControl(formBuilder, initialForm, form, status),
  }

  return formData
}

function createControl<FormT extends {}>(
  formBuilder: UseFormBuilder<FormT>,
  initialForm: Ref<FormT>,
  form: FormT | UnwrapNestedRefs<FormT>,
  status: Record<PropertyKey, StatusItem>,
) {
  const verify = () => {
    let isPass = true
    Object.keys(status).forEach((key) => {
      isPass = isPass && status[key].verify()
    })
    return isPass
  }

  const clearErrors = () => {
    Object.keys(status).forEach((key) => {
      status[key].clearError()
    })
  }

  const reset = (...fields: PropertyKey[]) => {
    initialForm.value = formBuilder()

    const needReset = (field: PropertyKey) => fields.length === 0 || fields.includes(field)

    for (const key in form) {
      if (!needReset(key))
        continue

      if (!isHasOwn(form, key))
        continue

      if (isHasOwn(initialForm.value, key)) {
        status[key]._ignoreUpdate(() => {
          form[key] = (initialForm.value as any)[key] as any
        })

        status[key].clearError()
      }
      else {
        delete form[key]
      }
    }
  }

  const onSubmit = (callback: () => unknown) => verify() ? callback() : null

  return {
    verify,
    clearErrors,
    reset,
    onSubmit,
  }
}

export * from './type'
