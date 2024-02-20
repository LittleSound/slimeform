import { isBaseType, isDateObject } from './is'

export interface DeepEqualReturn { equal: boolean, pointersEqual: boolean }

export function deepEqual(value1: any, value2: any): DeepEqualReturn {
  return deepEqualRecursion(value1, value2)
}

function deepEqualRecursion(value1: any, value2: any, stack = new WeakSet()): DeepEqualReturn {
  // 函数类型会通过 isBaseType 判断，直接进行 `===` 比较
  if (isBaseType(value1) || isBaseType(value2)) {
    return {
      equal: value1 === value2,
      pointersEqual: false,
    }
  }

  let pointersEqual = value1 === value2
  if (pointersEqual || stack.has(value1))
    return { equal: pointersEqual, pointersEqual }

  stack.add(value1)

  if (isDateObject(value1) && isDateObject(value2)) {
    return {
      equal: value1.getTime() === value2.getTime(),
      pointersEqual: false,
    }
  }

  const keys1 = Object.keys(value1)
  const keys2 = Object.keys(value2)

  if (keys1.length !== keys2.length)
    return { equal: false, pointersEqual: false }

  for (const key of keys1) {
    const item1 = value1[key]

    if (!keys2.includes(key))
      return { equal: false, pointersEqual }

    const item2 = value2[key]

    const res = deepEqualRecursion(item1, item2, stack)
    if (!res.equal)
      return res
    pointersEqual ||= res.pointersEqual
  }

  stack.delete(value1)
  return {
    equal: true,
    pointersEqual,
  }
}
