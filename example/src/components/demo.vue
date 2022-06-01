<script lang="ts" setup>
import { useForm } from 'slimeform'

const { form, status, reset, onSubmit, clearErrors } = useForm({
  // Initial form value
  form: () => ({
    age: '',
  }),
  // Verification rules
  rule: {
    age: [
      /* required */ val => !!val || 'Required',
      /* number */ val => !isNaN(Number(val)) || 'Expected number',
      /* length */ val => val.length < 3 || 'Length needs to be less than 3',
    ],
  },
  // Default error messages
  // defaultMessage: '',
})

function mySubmit() {
  // eslint-disable-next-line no-alert
  alert(`Age: ${form.age}`)
}
</script>

<template>
  <h3 mb-4>
    Please enter your age
  </h3>

  <form @submit.prevent="onSubmit(mySubmit)">
    <label>
      <input
        v-model="form.age"
        placeholder="What's your age?"
        type="text"
        autocomplete="false"
        p="x-4 y-2"
        w="250px"
        text="center"
        bg="transparent"
        border="~ rounded gray-200 dark:gray-700"
        outline="none active:none"
        :class="status.age.isError && '!border-red'"
      >
      <p class="text-red !mb-0 !mt-1 text-sm">{{ status.age.message }}</p>
    </label>
    <div space-x-3 mt-1>
      <button text-sm btn type="submit">
        Submit
      </button>

      <button text-sm btn type="button" @click="clearErrors">
        Clear Errors
      </button>

      <button text-sm btn type="button" @click="reset">
        Reset
      </button>

      <button text-sm btn bg-red hover="bg-red-600" type="button" @click="status.age.setError('Manual error!', true)">
        Set Error
      </button>
    </div>
  </form>
</template>
