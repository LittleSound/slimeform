import { expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import * as yup from 'yup'
import { useForm } from '../../src'
import { useSetup } from '../.test'
import { yupFieldRule } from './yup'

it('yupFieldRule', async () => {
  const wr = useSetup(() => {
    const local = ref('en')
    /** mock i18n `t` function */
    const mockT = () => local.value === 'en' ? 'A' : '文'

    const { form, status, isError } = useForm({
      form: () => ({
        age: '',
      }),
      rule: {
        age: [
          yupFieldRule(yup.string()
            .required(),
          ),
          yupFieldRule(yup.number()
            .max(120, () => mockT())
            .integer()
            .nullable(),
          ),
        ],
      },
    })
    return { form, status, isError, local }
  })
  wr.form.age = 'abc'

  await nextTick()
  expect(wr.status.age.isError).true
  expect(wr.isError).true
  expect(wr.status.age.message).includes('must be a `number`')

  wr.form.age = '18'

  await nextTick()
  expect(wr.status.age.isError).false
  expect(wr.isError).false
  expect(wr.status.age.message).toBe('')

  wr.form.age = '18.55'
  await nextTick()
  expect(wr.status.age.isError).true
  expect(wr.status.age.message).includes('integer')

  wr.form.age = ''
  await nextTick()
  expect(wr.status.age.isError).true
  expect(wr.status.age.message).includes('required')

  wr.form.age = '121'
  await nextTick()
  expect(wr.status.age.isError).true
  expect(wr.status.age.message).toBe('A')

  wr.local = 'zh-CN'
  await nextTick()
  expect(wr.status.age.message).toBe('文')

  wr.unmount()
})
