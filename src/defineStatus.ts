import type { Ref, UnwrapNestedRefs, WatchStopHandle } from 'vue'
import { computed, reactive, watchEffect } from 'vue'
import type { UseFormDefaultMessage, UseFormLazy, UseFormReturnRuleItem } from './type/form'
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
  rule: Record<PropertyKey, UseFormReturnRuleItem>,
) {
  for (const key in formObj) {
    if (!isHasOwn(formObj, key))
      continue

    status[key] = reactive({
      message: formDefaultMessage,
      isError: false,
      isDirty: computed(() => !deepEqual((initialForm.value as any)[key], formObj[key])),
      ...statusControl(key, status, formObj, formDefaultMessage, formLazy, rule),
    })
  }
}

function statusControl<FormT extends {}>(
  key: keyof UnwrapNestedRefs<FormT>,
  status: Record<PropertyKey, StatusItem>,
  formObj: UnwrapNestedRefs<FormT>,
  formDefaultMessage: UseFormDefaultMessage,
  formLazy: UseFormLazy,
  rule: Record<PropertyKey, UseFormReturnRuleItem>,
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

  const ruleForKey = rule[key]

  function ruleEffect() {
    if (!ruleForKey)
      return
    const { valid, message } = ruleForKey.validate(formObj[key], { fullResult: true })
    parseError(valid, message)
  }

  /** Used to stop watchEffect */
  let stopEffect: WatchStopHandle | null = null

  // Initialization rule check
  const init = () => {
    if (
      !ruleForKey
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
