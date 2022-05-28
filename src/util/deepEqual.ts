import { isBaseType, isDateObject, isObject } from './is'

export function deepEqual(value1: any, value2: any): boolean {
  return deepEqualRecursion(value1, value2)
}

function deepEqualRecursion(value1: any, value2: any, stack = new WeakSet()): boolean {
  // 函数类型会通过 isBaseType 判断，直接进行 `===` 比较
  if (isBaseType(value1) || isBaseType(value2) || stack.has(value1))
    return value1 === value2
  stack.add(value1)

  if (isDateObject(value1) && isDateObject(value2))
    return value1.getTime() === value2.getTime()

  const keys1 = Object.keys(value1)
  const keys2 = Object.keys(value2)

  if (keys1.length !== keys2.length)
    return false

  for (const key of keys1) {
    const item1 = value1[key]

    if (!keys2.includes(key))
      return false

    const item2 = value2[key]

    if (
      (isDateObject(item1) && isDateObject(item2))
      || (isObject(item1) && isObject(item2))
      || (Array.isArray(item1) && Array.isArray(item2))
        ? !deepEqualRecursion(item1, item2, stack)
        : item1 !== item2
    )
      return false
  }

  stack.delete(value1)
  return true
}
