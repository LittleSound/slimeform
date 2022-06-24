import { describe, expect, test, vi } from 'vitest'
import { createSubmit } from './submitter'
import { useForm } from '.'

describe('createSubmit', () => {
  const formData = useForm({
    form: () => ({
      field: 0,
    }),
    rule: {
      field: value => value !== 1 || 'error',
    },
  })
  const { form } = formData

  test('this should work', () => {
    const submitFn = vi.fn(() => 0)

    const { submit } = createSubmit(formData, submitFn)

    expect(submit()).toBe(0)
    expect(submitFn).toHaveBeenCalled()

    form.field = 1

    expect(submit()).toBe(undefined)
    expect(submitFn).toHaveBeenCalledTimes(1)
  })

  test('skip rule validation', () => {
    form.field = 1

    const submitFn = vi.fn(() => 0)

    const { submit } = createSubmit(formData, submitFn, {
      enableVerify: false,
    })

    expect(submit()).toBe(0)
    expect(submitFn).toHaveBeenCalledTimes(1)
  })

  test('async submit', async () => {
    form.field = 0

    const submitFn = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return 1
    })

    const { submit, submitting } = createSubmit(formData, submitFn)
    expect(submitting.value).false

    const res = submit()
    expect(res).toBeInstanceOf(Promise)

    expect(submitting.value).true
    expect(await res).toBe(1)
    expect(submitting.value).false

    expect(submitFn).toHaveBeenCalledOnce()
  })

  test('close `submitting` after async error', async () => {
    form.field = 0

    const submitFn = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('error')
    })

    const { submit, submitting } = createSubmit(formData, submitFn)
    expect(submitting.value).false

    const res = submit()
    expect(res).toBeInstanceOf(Promise)

    expect(submitting.value).true
    await expect(res).rejects.toThrowError()
    expect(submitting.value).false

    expect(submitFn).toHaveBeenCalledOnce()
  })
})
