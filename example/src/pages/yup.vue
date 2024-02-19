<script lang="ts" setup>
import { useForm } from 'slimeform'
import { yupFieldRule } from 'slimeform/resolvers'
import { number, object, string } from 'yup'
import RouteNav from '~/components/RouteNav.vue'

const local = ref('en')

/** mock i18n `t` function */
const mockT = (_: string) => local.value === 'en' ? 'Valid age up to 120 years old' : '有效年龄至 120 岁'
object({

})
const { form, status } = useForm({
  form: () => ({
    age: '',
    // ToDo: 支持 yup 的异步验证
    asyncTest: '',
  }),
  rule: {
    age: [
      yupFieldRule(string()
        .required(),
      ),
      yupFieldRule(number()
        .max(120, () => mockT('xxx_i18n_key'))
        .integer()
        .nullable(),
      ),
    ],
  },
  defaultMessage: 'none',
})
</script>

<template>
  <div>
    <RouteNav />
    <div
      space-y-5
      text-left
      max-w-400px
      w-full
      mx-auto
      rounded-xl
      border="1"
      p="4"
    >
      <h2 text-2xl mb-2>
        Yup Rule Demo
      </h2>
      <div>
        <h3 text-xl mb-1>
          Input Age
        </h3>
        <label>
          <input
            v-model="form.age"
            type="text"
            placeholder="edit me"
            autocomplete="false"

            p="x-4 y-2"
            w="250px"
            text="center"
            bg="transparent"
            border="~ rounded gray-200 dark:gray-700"
            outline="none active:none"
          >
        </label>
        <div>
          <p>Value: {{ form.age }}</p>
          <p>isDirty: {{ status.age.isDirty }}</p>
          <p>isError: {{ status.age.isError }}</p>
          <p>message: {{ status.age.message }}</p>
        </div>
      </div>
      <div>
        <h3 text-xl mb-1>
          Async Rule
        </h3>
        <label>
          <input
            v-model="form.asyncTest"
            type="text"
            placeholder="edit me"
            autocomplete="false"

            p="x-4 y-2"
            w="250px"
            text="center"
            bg="transparent"
            border="~ rounded gray-200 dark:gray-700"
            outline="none active:none"
          >
        </label>
        <div>
          <p>Value: {{ form.asyncTest }}</p>
          <p>isDirty: {{ status.asyncTest.isDirty }}</p>
          <p>isError: {{ status.asyncTest.isError }}</p>
          <p>message: {{ status.asyncTest.message }}</p>
        </div>
      </div>
      <div>
        <h4 text-lg mb-1>
          Local
        </h4>
        <div space-x-4>
          <label>
            <input v-model="local" type="radio" value="en">
            <span ml-1>en</span>
          </label>
          <label>
            <input v-model="local" type="radio" value="zh-CN">
            <span ml-1>zh-CN</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
