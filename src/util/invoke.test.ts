import { expect, test } from 'vitest'
import { invoke } from './invoke'

test('invoke', async () => {
  expect(invoke(() => 'hello')).toBe('hello')

  expect(await invoke(async () => 'wait')).toBe('wait')

  const add = (a: number, b: number) => a + b
  expect(invoke(add, 1, 1)).toBe(2)
})
