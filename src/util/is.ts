import type { BaseType } from '../type/util'

export const isFunction = <T extends Function>(value: unknown): value is T => typeof value === 'function'

export const isArray = <T extends unknown[]>(value: unknown): value is T => Array.isArray(value)

export function isHasOwn<T extends {}>(object: T, key: PropertyKey): key is keyof T {
  return Object.prototype.hasOwnProperty.call(object, key)
}

export const isNullOrUndefined = (value: unknown): value is null | undefined => value == null

export const isDateObject = (value: unknown): value is Date => value instanceof Date

export const isObjectType = <T extends object>(value: unknown): value is T => typeof value === 'object'

export const isObject = <T extends {}>(value: any): value is T =>
  isObjectType(value)
  && !isNullOrUndefined(value)
  && !isArray(value)
  && !isDateObject(value)

export const isBaseType = (value: unknown): value is BaseType =>
  isNullOrUndefined(value)
  || !isObjectType(value)

export const isPromise = (obj: unknown) => Promise.resolve(obj) === obj
