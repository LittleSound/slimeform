import type { RuleItem, UseFormReturnRule, UseFormRule } from './type'
import { invoke } from './util/invoke'
import { isFunction } from './util/is'

export function initRule<FormT extends {}>(formRule: UseFormRule<FormT> | undefined) {
  const rule = {} as UseFormReturnRule<FormT>

  for (const key in formRule) {
    const fieldRules = invoke(() => {
      const formRuleItem = formRule?.[key] as RuleItem | RuleItem[] | undefined
      return isFunction(formRuleItem) ? [formRuleItem] : formRuleItem
    })

    function validate(v: any) {
      for (const r of fieldRules || []) {
        const result = r(v)
        if (!result || typeof result === 'string')
          return result || ''
      }
      return true
    }

    rule[key] = { validate }
  }

  return rule
}
