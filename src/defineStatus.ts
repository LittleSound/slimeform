import type { Ref, UnwrapNestedRefs, WatchStopHandle } from 'vue'
import { computed, reactive, watchEffect } from 'vue'
import type { UseFormDefaultMessage, UseFormLazy, UseFormReturnRule, UseFormReturnRuleItem } from './type/form'
import type { StatusItem } from './type/formStatus'
import { deepEqual } from './util/deepEqual'
import { isHasOwn, isObjectType } from './util/is'
import { watchIgnorable } from './util/watchIgnorable'

export function initStatus<FormT extends {}>(
  status: Record<PropertyKey, StatusItem>,
  formObj: UnwrapNestedRefs<FormT>,
  initialForm: Ref<FormT>,
  formDefaultMessage: UseFormDefaultMessage,
  formLazy: UseFormLazy,
  rule: UseFormReturnRule<FormT>,
) {
  for (const key in formObj) {
    if (!isHasOwn(formObj, key))
      continue

    const fieldRule = isHasOwn(rule, key) ? rule[key] : undefined

    status[key] = reactive({
      message: formDefaultMessage,
      isError: false,
      isDirty: computed(() => {
        const res = deepEqual((initialForm.value as any)[key], formObj[key])
        if (process.env.NODE_ENV !== 'production') {
          if (res.pointersEqual)
            console.error(new Error('[SlimeForm]: in useForm(...): The "form" parameter is an invalid factory function because a duplicate reference is returned. Maybe you need a deep copy of your initial value in the form function.'))
        }

        return !res.equal
      }),
      ...statusControl(key, status, formObj, formDefaultMessage, formLazy, fieldRule),
    })
  }
}

function statusControl<FormT extends {}>(
  key: keyof UnwrapNestedRefs<FormT>,
  status: Record<PropertyKey, StatusItem>,
  formObj: UnwrapNestedRefs<FormT>,
  formDefaultMessage: UseFormDefaultMessage,
  formLazy: UseFormLazy,
  fieldRule?: UseFormReturnRuleItem,
) {
  function setError(message: string, isError = true) {
    status[key].message = message
    status[key].isError = isError
  }

  function ruleEffect() {
    if (!fieldRule)
      return
    const { message, valid } = fieldRule.validate(formObj[key], { fullResult: true })
    setError(message, !valid)
  }

  /** Used to stop watchEffect */
  let stopEffect: WatchStopHandle | null = null

  // Initialization rule check
  const init = () => {
    if (
      !fieldRule
      || formLazy
      || stopEffect // Determine if it has been initialized
    )
      return

    // monitor changes
    stopEffect = watchEffect(ruleEffect)
  }

  // Begin validation when user input
  const { ignoreUpdates } = watchIgnorable(
    () => formObj[key],
    init,
    {
      deep: isObjectType(formObj[key]),
    },
  )

  function clearError() {
    if (stopEffect) {
      stopEffect()
      stopEffect = null
    }
    setError(formDefaultMessage, false)
  }

  function verify() {
    ruleEffect()
    return !status[key].isError
  }

  return {
    verify,
    setError,
    clearError,
    init,
    _ignoreUpdate: ignoreUpdates,
  }
}
