import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
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

  it('this should work', () => {
    const submitFn = vi.fn(() => 0)

    const { submit } = createSubmit(formData, submitFn)

    expect(submit()).toBe(0)
    expect(submitFn).toHaveBeenCalled()

    form.field = 1

    expect(submit()).toBe(undefined)
    expect(submitFn).toHaveBeenCalledTimes(1)
  })

  it('skip rule validation', () => {
    form.field = 1

    const submitFn = vi.fn(() => 0)

    const { submit } = createSubmit(formData, submitFn, {
      enableVerify: false,
    })

    expect(submit()).toBe(0)
    expect(submitFn).toHaveBeenCalledTimes(1)
  })

  it('async submit', async () => {
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

  it('close `submitting` after async error', async () => {
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

describe('submitter in useForm', () => {
  it('this should work', async () => {
    const { form, submitter } = useForm({
      form: () => ({
        field: 0,
      }),
      rule: {
        field: value => value !== 1 || 'error',
      },
    })

    const {
      submit,
      submitting,
    } = submitter(async ({ form: subForm }) => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return subForm.field
    })

    expect(submitting.value).false
    const wait = expect(submit()).resolves.toBe(form.field)
    expect(submitting.value).true
    await wait
    expect(submitting.value).false
  })

  it('contains various parameters', async () => {
    const { form, submitter } = useForm({
      form: () => ({
        field: 0,
      }),
      rule: {
        field: value => value !== 1 || 'error',
      },
    })

    const {
      submit,
    } = submitter(async ({
      status,
      reset,
      // @ts-expect-error expected undefined
      submitter,
    }) => {
      await new Promise(resolve => setTimeout(resolve, 100))
      reset()
      expect(submitter).undefined
      return status.field.isDirty
    })

    form.field = 2
    await nextTick()

    await expect(submit()).resolves.toBe(false)
    expect(form.field).toBe(0)
  })
})
