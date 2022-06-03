<script lang="ts" setup>
import { useForm } from 'slimeform'
// import Unocss from 'unocss/vite'
import { yupFieldRule } from 'slimeform/resolvers'
import * as yup from 'yup'
import RouteNav from '~/components/RouteNav.vue'

const local = ref('en')

const t = (value: string) => local.value === 'en' ? value : '中文消息'

const { form, status } = useForm({
  form: () => ({
    textInput: '',
  }),
  rule: {
    textInput: yupFieldRule(yup.string().min(3, () => t('message')).max(10).nullable()),
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
          Text
        </h3>
        <label>
          <input
            v-model="form.textInput"
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
          <p>Value: {{ form.textInput }}</p>
          <p>isDirty: {{ status.textInput.isDirty }}</p>
          <p>isError: {{ status.textInput.isError }}</p>
          <p>message: {{ status.textInput.message }}</p>
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
