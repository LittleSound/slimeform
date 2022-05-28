import { reactive, readonly, ref } from 'vue'
import type { Ref, UnwrapNestedRefs } from 'vue'
import { isHasOwn } from './util/is'
import { initStatus } from './defineStatus'
import type { StatusItem } from './type/formStatus'
import type { UseFormBuilder, UseFormReturn, UseFormRule } from './type/form'

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
}): UseFormReturn<FormT> {
  const { form: formBuilder, rule: FormRule } = param

  const initialForm = ref(formBuilder()) as Ref<FormT>
  const form = reactive<FormT>({ ...initialForm.value })

  const status = reactive({} as Record<PropertyKey, StatusItem>)
  initStatus<FormT>(status, form, initialForm, FormRule)

  return {
    form,
    status: readonly(status) as any,
    ...createControl(formBuilder, initialForm, form, status),
  }
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

  const reset = () => {
    initialForm.value = formBuilder()
    for (const key in form) {
      if (isHasOwn(form, key)) {
        if (isHasOwn(initialForm.value, key)) {
          status[key]._ignoreUpdate(() => {
            form[key] = (initialForm.value as any)[key] as any
          })
        }
        else {
          delete form[key]
        }
      }
    }
    clearErrors()
  }

  const onSubmit = (callback: () => unknown) => verify() ? callback() : null

  return {
    verify,
    clearErrors,
    reset,
    onSubmit,
  }
}
