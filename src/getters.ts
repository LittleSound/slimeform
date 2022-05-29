import type { UnwrapNestedRefs } from 'vue'
import { computed } from 'vue'
import type { StatusItem } from './type/formStatus'
import { isHasOwn } from './util/is'

export function useDirtyFields<FormT extends {}>(
  form: UnwrapNestedRefs<FormT>,
  status: Record<PropertyKey, StatusItem>,
) {
  return computed(() => {
    const fields: Partial<FormT> = {}
    const keys = Object.keys(form)
    for (const key of keys) {
      if (status[key].isDirty && isHasOwn(form, key))
        (fields as any)[key] = form[key]
    }
    return fields
  })
}
