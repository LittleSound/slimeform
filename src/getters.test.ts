import { describe, expect, it, test } from 'vitest'
import { nextTick, reactive, watchEffect } from 'vue'
import { useSetup } from '../packages/.test'
import { useDirtyFields } from './getters'
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
    const { form, status, reset, dirtyFields } = useForm({
      form: () => ({
        // The initial value is mutable
        a: 1,
        b: {
          c: 2,
        },
      }),
    })
    return { form, status, reset, dirtyFields }
  })

  expect(wr.dirtyFields).toEqual({})

  wr.form.a = 11

  expect(wr.dirtyFields).toEqual({ a: 11 })

  wr.form.b.c = 3
  expect(wr.dirtyFields).toEqual({ a: 11, b: { c: 3 } })

  wr.form.b = { c: 4 }
  expect(wr.dirtyFields).toEqual({ a: 11, b: { c: 4 } })

  wr.form.b.c = 5
  expect(wr.dirtyFields).toEqual({ a: 11, b: { c: 5 } })
})
