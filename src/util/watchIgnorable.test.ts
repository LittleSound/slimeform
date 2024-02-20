import { expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { watchIgnorable } from './watchIgnorable'

it('ignore async updates', async () => {
  const source = ref(0)
  const target = ref(0)
  const { ignoreUpdates } = watchIgnorable(source, value => target.value = value)

  source.value = 1

  await nextTick()
  expect(target.value).toBe(1)

  ignoreUpdates(() => {
    source.value = 2
    source.value = 3
  })

  await nextTick()
  expect(target.value).toBe(1)

  ignoreUpdates(() => {
    source.value = 4
  })
  source.value = 5

  await nextTick()
  expect(target.value).toBe(5)
})
