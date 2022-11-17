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
      isDirty: computed(() => !deepEqual((initialForm.value as any)[key], formObj[key])),
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

  function parseError(valid: boolean, message: string | null) {
    if (!valid) {
      setError(message || formDefaultMessage)
      return true
    }
    else {
      setError(formDefaultMessage, false)
      return false
    }
  }

  function ruleEffect() {
    if (!fieldRule)
      return
    const { valid, message } = fieldRule.validate(formObj[key], { fullResult: true })
    parseError(valid, message)
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
