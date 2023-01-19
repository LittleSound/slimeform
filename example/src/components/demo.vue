<script lang="ts" setup>
import { useForm } from 'slimeform'

const { form, status, reset, submitter, clearErrors, isError, rule, isDirty } = useForm({
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
  defaultMessage: '\u00A0',
})

const { submit, submitting } = submitter(async ({ form }) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  // eslint-disable-next-line no-alert
  alert(`Age: ${form.age}`)
})

const preInput = ref('')
const preInputStatus = ref({ valid: true, message: '\u00A0' })
function validatePreInput() {
  const { valid, message } = rule.age.validate(preInput.value, { fullResult: true })
  preInputStatus.value = { valid, message }

  if (valid) {
    form.age = preInput.value
    preInput.value = ''
  }
}
</script>

<template>
  <h3 mb-4>
    Please enter your age
  </h3>

  <form space="y-2" @submit.prevent="submit">
    <!-- Input Age -->
    <label class="block">
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

    <div flex="~" justify="center" text="xl">
      <div class="i-carbon:arrow-up" />
    </div>

    <!-- Test Validate -->
    <label class="block">
      <div space="x-2" flex="~" justify="center">
        <input
          v-model="preInput"
          placeholder="Pre input"
          type="text"
          autocomplete="false"
          p="x-4 y-1"
          w="165px"
          text="center sm"
          bg="transparent"
          border="~ rounded gray-200 dark:gray-700"
          outline="none active:none"
          :class="!preInputStatus.valid && '!border-red'"
        >
        <button text-sm btn type="button" @click="validatePreInput()">
          Validate
        </button>
      </div>
      <p class="text-red !mb-0 !mt-1 text-sm">{{ preInputStatus.message }}</p>
    </label>

    <!-- Buttons -->
    <div space-x-3>
      <button text-sm btn type="submit" :disabled="isError || submitting">
        {{
          submitting
            ? 'Submitting...'
            : 'Submit'
        }}
      </button>

      <button text-sm btn type="button" :disabled="!isError" @click="clearErrors">
        Clear Errors
      </button>

      <button text-sm btn type="button" :disabled="!(isDirty || isError)" @click="reset()">
        Reset
      </button>

      <button text-sm btn bg-red hover="bg-red-600" type="button" @click="status.age.setError('Manual error!', true)">
        Set Error
      </button>
    </div>
  </form>
</template>
