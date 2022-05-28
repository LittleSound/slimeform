export const isFunction = <T extends Function>(value: any): value is T => typeof value === 'function'

export const isArray = <T extends any[]>(value: any): value is T => Array.isArray(value)

export function isHasOwn<T extends {}>(object: T, key: PropertyKey): key is keyof T {
  return Object.prototype.hasOwnProperty.call(object, key)
}
