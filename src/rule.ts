import type { RuleItem, UseFormReturnRule, UseFormRule, ValidateOptions } from './type'
import { invoke } from './util/invoke'
import { isFunction } from './util/is'

export function initRule<FormT extends {}>(formRule: UseFormRule<FormT> | undefined, defaultMessage: string) {
  const rule = {} as UseFormReturnRule<FormT>

  for (const key in formRule) {
    const fieldRules = invoke(() => {
      const formRuleItem = formRule?.[key] as RuleItem | RuleItem[] | undefined
      return isFunction(formRuleItem) ? [formRuleItem] : formRuleItem
    })

    function validate(v: any): boolean
    function validate(v: any, validateOptions?: ValidateOptions): { valid: boolean; message: string }

    function validate(v: any, validateOptions: ValidateOptions = {}) {
      const { fullResult } = validateOptions
      for (const r of fieldRules || []) {
        const result = r(v)
        // result as string or falsity
        // Exit validation on error
        if (!result || typeof result === 'string')
          return fullResult ? { valid: false, message: result || defaultMessage } : false
      }
      // no errors
      return fullResult ? { valid: true, message: defaultMessage } : true
    }

    rule[key] = { validate }
  }

  return rule
}
