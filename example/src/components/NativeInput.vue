<script lang="ts" setup>
import { useForm } from 'root/dist'

const { form, status } = useForm({
  form: () => ({
    textInput: '',
    isChecked: false,
    selected: ['A'],
  }),
  rule: {
    selected: [
      val => !!val.includes('A') || 'A must be selected',
      val => val.length < 3 || 'Select at most two',
    ],
  },
})
</script>

<template>
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
      Native Input Demo
    </h2>
    <div>
      <h3 text-xl mb-1>
        Text
      </h3>
      <label>
        <p>Message is: {{ form.textInput }}</p>
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
    </div>
    <div>
      <h3 text-xl mb-1>
        Checkbox
      </h3>
      <label>
        <input id="checkbox" v-model="form.isChecked" type="checkbox" mr-1>
        <label for="checkbox">{{ form.isChecked }}</label>
      </label>
    </div>
    <div>
      <h3 text-xl mb-1>
        Select Multiple
      </h3>
      <label>
        <div flex space-x-4>
          <select v-model="form.selected" multiple border="1 rounded-xl" w-110px>
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>
          <div>
            <p>Selected: {{ form.selected }}</p>
            <p>isDirty: {{ status.selected.isDirty }}</p>
            <p>isError: {{ status.selected.isError }}</p>
            <p>message: {{ status.selected.message || 'none' }}</p>
          </div>
        </div>
      </label>
    </div>
  </div>
</template>
