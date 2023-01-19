import { describe, expect, it, test } from 'vitest'
import { nextTick, reactive, watchEffect } from 'vue'
import { useSetup } from '../packages/.test'
import { useDirtyFields, useIsError } from './getters'
import type { StatusItem } from './type/formStatus'
import { useForm } from '.'

describe('useDirtyFields', () => {
  it('should be defined', () => {
    expect(useDirtyFields).toBeDefined()
  })

  it('should work', async () => {
    const form = reactive({
      a: '1',
      b: '2',
    })
    const status = reactive({
      a: {
        isDirty: false,
      },
      b: {
        isDirty: true,
      },
    }) as any as Record<PropertyKey, StatusItem>

    const dirtyFields = useDirtyFields(form, status)

    expect(dirtyFields.value).toEqual({ b: '2' })

    let effectValue = ''
    watchEffect(() => effectValue = dirtyFields.value.b || '')

    form.b = '3'
    expect(dirtyFields.value).toEqual({ b: '3' })
    await nextTick()
    expect(effectValue).toBe('3')

    status.a.isDirty = true
    status.b.isDirty = false
    expect(dirtyFields.value).toEqual({ a: '1' })

    status.a.isDirty = true
    status.b.isDirty = true
    expect(dirtyFields.value).toEqual({ a: '1', b: '3' })

    status.a.isDirty = false
    status.b.isDirty = false
    expect(dirtyFields.value).toEqual({})
  })

  it('deep value sync', async () => {
    const form = reactive({
      a: {
        b: {
          c: 1,
        },
      },
    })
    const status = reactive({
      a: {
        isDirty: false,
      },
    }) as any as Record<PropertyKey, StatusItem>

    const dirtyFields = useDirtyFields(form, status)

    expect(dirtyFields.value).toEqual({})

    status.a.isDirty = true
    expect(dirtyFields.value).toEqual({ a: { b: { c: 1 } } })

    let c = 111
    watchEffect(() => c = dirtyFields.value.a?.b?.c || 0)

    form.a.b.c = 222
    expect(dirtyFields.value).toEqual({ a: { b: { c: 222 } } })
    await nextTick()
    expect(c).toBe(222)
  })
})

test('useForm dirtyFields', () => {
  const wr = useSetup(() => {
    const { form, status, reset, dirtyFields, isDirty } = useForm({
      form: () => ({
        // The initial value is mutable
        a: 1,
        b: {
          c: 2,
        },
      }),
    })
    return { form, status, reset, dirtyFields, isDirty }
  })

  expect(wr.dirtyFields).toEqual({})
  expect(wr.isDirty).false

  wr.form.a = 11

  expect(wr.dirtyFields).toEqual({ a: 11 })
  expect(wr.isDirty).true

  wr.form.b.c = 3
  expect(wr.dirtyFields).toEqual({ a: 11, b: { c: 3 } })
  expect(wr.isDirty).true

  wr.form.b = { c: 4 }
  expect(wr.dirtyFields).toEqual({ a: 11, b: { c: 4 } })
  expect(wr.isDirty).true

  wr.form.b.c = 5
  expect(wr.dirtyFields).toEqual({ a: 11, b: { c: 5 } })
  expect(wr.isDirty).true
})

// 确保重制后的修改检查依然是正确的
// Ensure that the modification checks are still correct after the remake
test('useForm reset dirtyFields', async () => {
  const wr = useSetup(() => {
    const { form, status, reset, dirtyFields, isDirty } = useForm({
      form: () => ({
        a: {
          b: '',
        },
      }),
    })
    return { form, status, reset, dirtyFields, isDirty }
  })

  expect(wr.dirtyFields).toEqual({})
  expect(wr.isDirty).false

  wr.form.a.b = '1'
  await nextTick()

  wr.reset()
  await nextTick()
  expect(wr.dirtyFields).toEqual({})
  expect(wr.isDirty).false

  wr.form.a.b = '2'
  await nextTick()
  expect(wr.status.a.isDirty).true
  expect(wr.dirtyFields).toEqual({ a: { b: '2' } })
  expect(wr.isDirty).true
})

test('useIsError', () => {
  expect(useIsError).toBeDefined()

  const status = reactive({
    a: {
      isError: false,
    },
    b: {
      isError: false,
    },
  }) as any as Record<PropertyKey, StatusItem>
  const isError = useIsError(status)

  expect(isError.value).toBe(false)

  status.a.isError = true
  expect(isError.value).toBe(true)

  status.b.isError = true
  expect(isError.value).toBe(true)

  status.a.isError = false
  expect(isError.value).toBe(true)

  status.b.isError = false
  expect(isError.value).toBe(false)
})
