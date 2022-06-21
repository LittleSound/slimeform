import type { Ref, UnwrapNestedRefs, WatchStopHandle } from 'vue'
import { computed, reactive, watchEffect } from 'vue'
import type { RuleItem, UseFormDefaultMessage, UseFormRule } from './type/form'
import type { StatusItem } from './type/formStatus'
import type { OnCleanup } from './type/util'
import { deepEqual } from './util/deepEqual'
import { invoke } from './util/invoke'
import { isFunction, isHasOwn, isObjectType, isPromise } from './util/is'
import { watchIgnorable } from './util/watchIgnorable'

export function initStatus<FormT extends {}>(
  status: Record<PropertyKey, StatusItem>,
  formObj: UnwrapNestedRefs<FormT>,
  initialForm: Ref<FormT>,
  formDefaultMessage: UseFormDefaultMessage,
  formRule?: UseFormRule<FormT>,
) {
  for (const key in formObj) {
    if (!isHasOwn(formObj, key))
      continue

    // Functions or arrays of functions are allowed
    const fieldRules = invoke(() => {
      const formRuleItem = formRule?.[key] as RuleItem | RuleItem[] | undefined
      return isFunction(formRuleItem) ? [formRuleItem] : formRuleItem
    })

    status[key] = reactive({
      message: formDefaultMessage,
      isError: false,
      verifying: false,
      isDirty: computed(() => !deepEqual((initialForm.value as any)[key], formObj[key])),
      ...statusControl(key, status, formObj, fieldRules, formDefaultMessage),
    })
  }
}

function statusControl<FormT extends {}>(
  key: keyof UnwrapNestedRefs<FormT>,
  status: Record<PropertyKey, StatusItem>,
  formObj: UnwrapNestedRefs<FormT>,
  fieldRules: RuleItem<any>[] | undefined,
  formDefaultMessage: UseFormDefaultMessage,
) {
  function setError(message: string, isError = true) {
    status[key].message = message
    status[key].isError = isError
  }

  /** parsing verification result */
  function parseError(result: string | boolean) {
    // result as string or falsity
    // Exit validation on error
    if (!result || typeof result === 'string') {
      setError(result || formDefaultMessage)
      return true
    } // no errors
    else {
      setError(formDefaultMessage, false)
      return false
    }
  }

  /** Number of asynchronous validations in progress */
  let verifyingCount = 0

  function ruleEffect(onCleanup?: OnCleanup) {
    let isEnded = false
    if (onCleanup)
      onCleanup(() => isEnded = true)

    // Traverse the ruleset and check the rules
    for (const rule of fieldRules || []) {
      const result = rule(formObj[key], onCleanup)

      // Determine whether it is synchronous verification
      if (!isPromise(result)) {
        if (parseError(result)) {
          isEnded = true
          break
        }
      }
      else {
        // If it's async validation, wait for its result in a new function
        invoke(async () => {
          verifyingCount += 1
          status[key].verifying = !!verifyingCount
          try {
            const err = await result
            // Validation will end when there is any one error result
            // If the validation has ended, no further results will be processed
            if (isEnded)
              return
            if (parseError(err))
              isEnded = true
          }
          finally {
            verifyingCount -= 1
            status[key].verifying = !!verifyingCount
          }
        })
      }
    }
  }

  /** Used to stop watchEffect */
  let stopEffect: WatchStopHandle | null = null

  // Initialization rule check
  const init = () => {
    // Determine if it has been initialized
    if (!fieldRules || stopEffect)
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
