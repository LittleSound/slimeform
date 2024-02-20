import { expect, it } from 'vitest'
import { message } from '../src/constants'

it('message contains \'Hello\'', () => {
  expect(message).toContain('Hello')
})
