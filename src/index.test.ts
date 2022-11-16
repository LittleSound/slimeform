import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useSetup } from '../packages/.test'
import { useForm } from '.'

describe('useForm', () => {
  it('should be defined', () => {
    expect(useForm).toBeDefined()
  })

  it('should work', async () => {
    const wrapper = useSetup(() => {
      const { form, status, isError } = useForm({
        form: () => ({
          name: '',
          age: '',
        }),
        rule: {
          age: val => !isNaN(+val) || 'expect numbers',
        },
      })
      return { form, status, isError }
    })

    // Is it modified
    expect(wrapper.status.name.isDirty).false
    expect(wrapper.status.age.isDirty).false

    wrapper.form.age = 'abc'

    // Is it modified
    expect(wrapper.status.name.isDirty).false
    expect(wrapper.status.age.isDirty).true

    await nextTick()
    // age
    expect(wrapper.form.age).toBe('abc')
    expect(wrapper.status.age.isError).true
    expect(wrapper.isError).true
    expect(wrapper.status.age.message).toBe('expect numbers')
    // name
    expect(wrapper.form.name).toBe('')
    expect(wrapper.status.name.isError).false
    expect(wrapper.status.name.message).toBe('')

    wrapper.form.age = '18'

    // Is it modified
    expect(wrapper.status.name.isDirty).false
    expect(wrapper.status.age.isDirty).true

    await nextTick()
    // age
    expect(wrapper.form.age).toBe('18')
    expect(wrapper.status.age.isError).false
    expect(wrapper.isError).false
    expect(wrapper.status.age.message).toBe('')
    // name
    expect(wrapper.form.name).toBe('')
    expect(wrapper.status.name.isError).false
    expect(wrapper.status.name.message).toBe('')

    wrapper.unmount()
  })

  // 规则验证在第一次值更改后开始工作
  it('Rule validation starts working after the first value change', async () => {
    const wrapper = useSetup(() => {
      const { form, status, isError } = useForm({
        form: () => ({
          name: '',
          age: '',
        }),
        rule: {
          age: val => !!val || 'required',
          name: val => !!val || 'required',
        },
      })
      return { form, status, isError }
    })

    await nextTick()
    // age
    expect(wrapper.status.age.isError).false
    expect(wrapper.status.age.message).toBe('')
    // name
    expect(wrapper.status.name.isError).false
    expect(wrapper.status.name.message).toBe('')
    // any error
    expect(wrapper.isError).false

    wrapper.form.age = '18'

    // Is it modified
    expect(wrapper.status.name.isDirty).false
    expect(wrapper.status.age.isDirty).true

    await nextTick()
    // age
    expect(wrapper.status.age.isError).false
    expect(wrapper.status.age.message).toBe('')
    // name
    expect(wrapper.status.name.isError).false
    expect(wrapper.status.name.message).toBe('')
    // any error
    expect(wrapper.isError).false

    wrapper.form.age = ''

    // Is it modified
    expect(wrapper.status.name.isDirty).false
    expect(wrapper.status.age.isDirty).false

    await nextTick()
    // age
    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('required')
    // name
    expect(wrapper.status.name.isError).false
    expect(wrapper.status.name.message).toBe('')
    // any error
    expect(wrapper.isError).true

    wrapper.unmount()
  })

  // 响应规则更改
  it('Responding to rule changes', async () => {
    const useI18n = () => {
      const local = ref('en')
      return {
        local,
        t: (key: string) => local.value === 'en' ? key : '必填',
      }
    }

    const wrapper = useSetup(() => {
      const { t, local } = useI18n()
      const { form, status } = useForm({
        form: () => ({
          age: '',
        }),
        rule: {
          age: val => !!val || t('required'),
        },
      })
      return { form, status, local }
    })

    await nextTick()
    expect(wrapper.status.age.isError).false
    expect(wrapper.status.age.message).toBe('')

    // Rule validation starts working after the first value change
    wrapper.local = 'zh-CN'

    await nextTick()
    expect(wrapper.status.age.isError).false
    expect(wrapper.status.age.message).toBe('')

    wrapper.form.age = '18'
    await nextTick()
    wrapper.form.age = ''

    await nextTick()
    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('必填')

    wrapper.local = 'en'

    await nextTick()
    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('required')

    wrapper.unmount()
  })

  // 使用数组定义多个规则
  it('Define multiple rules using an array', async () => {
    const wrapper = useSetup(() => {
      const { form, status } = useForm({
        form: () => ({
          age: '',
        }),
        rule: {
          age: [
            val => !!val || 'required',
            val => !isNaN(+val) || 'expect numbers',
          ],
        },
      })
      return { form, status }
    })

    wrapper.form.age = 'abc'

    await nextTick()
    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('expect numbers')

    wrapper.form.age = ''

    await nextTick()
    expect(wrapper.status.age.message).toBe('required')
    expect(wrapper.status.age.isError).true

    wrapper.unmount()
  })

  // 手动触发验证和清除错误
  it('Manually trigger validation and clearErrors', async () => {
    const wrapper = useSetup(() => {
      const { form, status, clearErrors, verify } = useForm({
        form: () => ({
          age: '',
        }),
        rule: {
          age: val => !!val || 'required',
        },
      })
      return { form, status, clearErrors, verify }
    })

    wrapper.verify()

    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('required')

    wrapper.status.age.setError('a error')

    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('a error')

    // 等待后再次检查，确保不会被副作用覆盖
    // Check again after waiting to make sure it is not overwritten by side effects
    await nextTick()
    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('a error')

    wrapper.clearErrors()

    expect(wrapper.status.age.isError).false
    expect(wrapper.status.age.message).toBe('')

    wrapper.unmount()
  })

  // 表单重置功能
  it('reset the form', async () => {
    // Increments by one for each call
    const [counter, add] = ((i = 0) => [() => i, () => i++])()

    const wrapper = useSetup(() => {
      const { form, status, reset } = useForm({
        form: () => ({
          // The initial value is mutable
          age: `${counter()}`,
          isAgree: true,
        }),
        rule: {
          isAgree: val => !!val || 'required',
          age: [
            val => !!val || 'required',
            val => !isNaN(+val) || 'expect numbers',
          ],
        },
      })
      return { form, status, reset }
    })

    wrapper.form.isAgree = false
    wrapper.form.age = 'abc'

    await nextTick()
    // isAgree
    expect(wrapper.status.isAgree.isError).true
    expect(wrapper.status.isAgree.message).toBe('required')
    // age
    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('expect numbers')

    add()
    wrapper.reset()

    await nextTick()
    // isAgree
    expect(wrapper.form.isAgree).toBe(true)
    expect(wrapper.status.isAgree.isDirty).false
    expect(wrapper.status.isAgree.isError).false
    expect(wrapper.status.isAgree.message).toBe('')
    // age
    expect(wrapper.form.age).toBe('1')
    expect(wrapper.status.age.isDirty).false
    expect(wrapper.status.age.isError).false
    expect(wrapper.status.age.message).toBe('')

    wrapper.unmount()
  })

  // 重置特定字段
  it('reset the fields', async () => {
    // Increments by one for each call
    const [counter, add] = ((i = 0) => [() => i, () => i++])()

    const wrapper = useSetup(() => {
      const { form, status, reset } = useForm({
        form: () => ({
          // The initial value is mutable
          age: `${counter()}`,
          isAgree: true,
        }),
        rule: {
          isAgree: val => !!val || 'required',
          age: [
            val => !!val || 'required',
            val => !isNaN(+val) || 'expect numbers',
          ],
        },
      })
      return { form, status, reset }
    })

    wrapper.form.isAgree = false
    wrapper.form.age = 'abc'

    await nextTick()
    // isAgree
    expect(wrapper.status.isAgree.isError).true
    expect(wrapper.status.isAgree.message).toBe('required')
    // age
    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('expect numbers')

    wrapper.reset('isAgree')

    await nextTick()
    // isAgree
    expect(wrapper.form.isAgree).toBe(true)
    expect(wrapper.status.isAgree.isDirty).false
    expect(wrapper.status.isAgree.isError).false
    expect(wrapper.status.isAgree.message).toBe('')
    // age
    expect(wrapper.form.age).toBe('abc')
    expect(wrapper.status.age.isDirty).true
    expect(wrapper.status.age.isError).true
    expect(wrapper.status.age.message).toBe('expect numbers')

    add()
    wrapper.reset('age', 'isAgree')

    await nextTick()
    // isAgree
    expect(wrapper.form.isAgree).toBe(true)
    expect(wrapper.status.isAgree.isDirty).false
    expect(wrapper.status.isAgree.isError).false
    expect(wrapper.status.isAgree.message).toBe('')
    // age
    expect(wrapper.form.age).toBe('1')
    expect(wrapper.status.age.isDirty).false
    expect(wrapper.status.age.isError).false
    expect(wrapper.status.age.message).toBe('')

    wrapper.unmount()
  })

  // 自定义表单校验信息占位内容
  it('Customize the placeholder content of the validation message', async () => {
    const wrapper = useSetup(() => {
      const { form, status } = useForm({
        form: () => ({
          name: '',
        }),
        rule: {
          name: val => !!val || 'Required',
        },
        defaultMessage: '\u00A0',
      })
      return { form, status }
    })

    wrapper.form.name = 'a'

    await nextTick()
    expect(wrapper.status.name.isError).false
    expect(wrapper.status.name.message).toBe('\u00A0')

    wrapper.form.name = ''

    await nextTick()
    expect(wrapper.status.name.isError).true
    expect(wrapper.status.name.message).toBe('Required')

    wrapper.unmount()
  })

  it('can be lazy so that rule won\'t be automaticlly verified when data changes', async () => {
    const wrapper = useSetup(() => {
      const { form, status, isError, verify, dirtyFields } = useForm({
        form: () => ({
          name: '',
          age: '',
        }),
        rule: {
          age: val => !isNaN(+val) || 'expect numbers',
        },
        lazy: true,
      })
      return { form, status, isError, verify, dirtyFields }
    })

    wrapper.form.age = 'abc'
    expect(wrapper.status.age.isDirty).toBe(true)

    await nextTick()

    expect(wrapper.status.age.isError).toBe(false)
    expect(wrapper.isError).toBe(false)
    expect(wrapper.status.age.message).toBe('')

    wrapper.verify()

    expect(wrapper.status.age.isError).toBe(true)
    expect(wrapper.isError).toBe(true)
    expect(wrapper.status.age.message).toBe('expect numbers')
  })

  it('returns the rule object', async () => {
    const wrapper = useSetup(() => {
      const { form, rule } = useForm({
        form: () => ({
          name: '',
          age: '',
        }),
        rule: {
          age: val => !isNaN(+val) || 'expect numbers',
          name: v => v.length < 3 || 'to many characters',
        },
        lazy: true,
      })

      const myUserName = 'abcd'
      if (rule.name.validate(myUserName) === true)
        form.name = myUserName // won't pass into form

      return { form, rule }
    })

    expect(wrapper.form.name).toBe('')
    expect(wrapper.rule.age.validate('abc')).toBe('expect numbers')
  })
})

describe('object type field', () => {
  it('should work', async () => {
    const wrapper = useSetup(() => {
      const { form, status } = useForm({
        form: () => ({
          arr: [] as string[],
          obj: null as unknown,
        }),
        rule: {
          arr: [
            val => !!val.length || 'required',
            val => !!val.includes('A') || 'A must be selected',
          ],
          obj: [
            val => !!(val as any)?.b?.c || 'need a',
          ],
        },
      })
      return { form, status }
    })

    wrapper.form.arr = []
    expect(wrapper.status.arr.isDirty).false
    await nextTick()
    expect(wrapper.status.arr.isError).true
    expect(wrapper.status.arr.message).toBe('required')

    wrapper.form.arr.push('B')
    expect(wrapper.status.arr.isDirty).true
    await nextTick()
    expect(wrapper.status.arr.isError).true
    expect(wrapper.status.arr.message).toBe('A must be selected')

    wrapper.form.arr.push('A')
    await nextTick()
    expect(wrapper.status.arr.isError).false
    expect(wrapper.status.arr.message).toBe('')

    wrapper.form.obj = { a: 1, b: { c: 2 } }
    expect(wrapper.status.obj.isDirty).true
    await nextTick()
    expect(wrapper.status.obj.isError).false
    expect(wrapper.status.obj.message).toBe('')

    ;(wrapper.form.obj as any).b.c = undefined
    await nextTick()
    expect(wrapper.status.obj.isError).true
    expect(wrapper.status.obj.message).toBe('need a')
  })

  it('deep effect', async () => {
    const wr = useSetup(() => {
      const { form, status } = useForm({
        form: () => ({
          arr: [{
            a: {
              b: 1,
            },
          }],
          obj: {
            a: {
              b: 1,
            },
          },
        }),
        rule: {
          arr: [
            val => !!val.length || 'required',
            val => !val.filter(item => item.a.b !== 1).length || 'need 1',
          ],
          obj: [
            val => !!val?.a.b || 'need truthy',
          ],
        },
      })
      return { form, status }
    })

    expect(wr.status.arr.isDirty).false
    expect(wr.status.obj.isDirty).false

    // Array
    wr.form.arr.push({ a: { b: 2 } })
    expect(wr.status.arr.isDirty).true
    expect(wr.status.obj.isDirty).false
    await nextTick()
    expect(wr.status.arr.isError).true
    expect(wr.status.arr.message).toBe('need 1')
    expect(wr.status.obj.isError).false
    expect(wr.status.obj.message).toBe('')

    wr.form.arr.pop()
    expect(wr.status.arr.isDirty).false
    await nextTick()
    expect(wr.status.arr.isError).false
    expect(wr.status.arr.message).toBe('')

    wr.form.arr.pop()
    expect(wr.status.arr.isDirty).true
    await nextTick()
    expect(wr.status.arr.isError).true
    expect(wr.status.arr.message).toBe('required')

    // Object
    wr.form.obj.a.b = 2
    expect(wr.status.obj.isDirty).true
    await nextTick()
    expect(wr.status.obj.isError).false
    expect(wr.status.obj.message).toBe('')

    wr.form.obj.a.b = 0
    await nextTick()
    expect(wr.status.obj.isError).true
    expect(wr.status.obj.message).toBe('need truthy')
  })
})
