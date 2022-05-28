import { isFunction, watchIgnorable } from '@vueuse/shared'
import type { Ref, UnwrapNestedRefs, WatchStopHandle } from 'vue'
import { computed, reactive, watchEffect } from 'vue'
import type { RuleItem, UseFormRule } from './type/form'
import type { StatusItem } from './type/formStatus'
import { isHasOwn } from './util/is'

export function initStatus<FormT extends {}>(
  status: Record<PropertyKey, StatusItem>,
  formObj: UnwrapNestedRefs<FormT>,
  initialForm: Ref<FormT>,
  formRule?: UseFormRule<FormT>,
) {
  for (const key in formObj) {
    if (!isHasOwn(formObj, key))
      continue

    status[key] = reactive({
      message: '',
      isError: false,
      isDirty: computed(() => formObj[key] !== (initialForm.value as any)[key]),
      ...statusControl(key, status, formObj, formRule),
    })
  }
}

function statusControl<FormT extends {}>(
  key: keyof UnwrapNestedRefs<FormT>,
  status: Record<PropertyKey, StatusItem>,
  formObj: UnwrapNestedRefs<FormT>,
  formRule: UseFormRule<FormT> | undefined,
) {
  function setError(message: string, isError = true) {
    status[key].message = message
    status[key].isError = isError
  }

  function ruleEffect() {
    const formRuleItem = (formRule as any)?.[key] as RuleItem | RuleItem[]
    if (!formRuleItem)
      return true

    // Functions or arrays of functions are allowed
    const fieldRules = isFunction(formRuleItem) ? [formRuleItem] : formRuleItem

    // Traverse the ruleset and check the rules
    for (const rule of fieldRules || []) {
      const result = rule(formObj[key])

      // result as string or falsity
      // Exit validation on error
      if (!result || typeof result === 'string') {
        setError(result || '')
        break
      } // no errors
      else {
        setError('', false)
      }
    }
  }

  /** Used to stop watchEffect */
  let stopEffect: WatchStopHandle | null = null

  // Initialization rule check
  const init = () => {
    // Determine if it has been initialized
    if (stopEffect)
      return

    // monitor changes
    stopEffect = watchEffect(ruleEffect)
  }
  // Begin validation when user input
  const { ignoreUpdates } = watchIgnorable(() => formObj[key], init)

  function clearError() {
    if (stopEffect) {
      stopEffect()
      stopEffect = null
    }
    setError('', false)
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
