import { expect, test } from 'vitest'
import { isPromise } from './is'

test('isPromise', () => {
  const promise = new Promise(() => 1)
  expect(isPromise(promise)).toBe(true)

  expect(isPromise(1234)).toBe(false)
  expect(isPromise(null)).toBe(false)
  expect(isPromise(undefined)).toBe(false)
  expect(isPromise('abcd')).toBe(false)
  expect(isPromise({ then: () => {} })).toBe(false)
  expect(isPromise([])).toBe(false)

  const promise2 = (async () => 1)()
  expect(isPromise(promise2)).toBe(true)
})
