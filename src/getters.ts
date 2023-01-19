import type { UnwrapNestedRefs } from 'vue'
import { computed, readonly } from 'vue'
import type { StatusItem } from './type/formStatus'
import { isEmptyObject, isHasOwn } from './util/is'

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
    return readonly(fields)
  })
}

export function useIsError(
  status: Record<PropertyKey, StatusItem>,
) {
  return computed(() => {
    const keys = Object.keys(status)
    for (const key of keys) {
      if (status[key]?.isError)
        return true
    }
    return false
  })
}

export function useIsFormDirty(dirtyFields: ReturnType<typeof useDirtyFields>) {
  return computed(() => !isEmptyObject(dirtyFields.value))
}
