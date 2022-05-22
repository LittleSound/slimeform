<br>
<br>
<br>

<p align="center">
  <img height="80px" src="https://github.com/LittleSound/slimeform/raw/main/example/public/favicon.svg">
</p>

<h1 align="center">SlimeForm</h1>
<p align="center">English | <a href="https://github.com/LittleSound/slimeform/blob/HEAD/README.zh-Hans.md">简体中文</a></p>

<br>

Form state management and validation

## Why?

We usually use all sorts of different pre-made form components in vue projects which may be written by ourselves, or come from other third-party UI libraries. As for those third-party UI libraries, they might shipped their own form validators with libraries, however we still will need to build our form validators for those components written by us. In most of the time, those form validators were not 'unified' or we say compatible to the others, especially when you mixed your own components with third-party components together in one project where thing might become tricky.

Base on modern CSS utilities class and component-based design, it has now become way more easier to write your own `<input>` component in specific style and assemble them as a form, however, when you need to integrate form state management and rule validation with all the related input fields, the problem will be more complex.

## TODO

- [x] Improve the functionalities
  - [x] Use reactive type to return the form
  - [x] For a single rule, the array can be omitted
  - [x] Mark whether the value of the form has been modified
- [x] Documentations
- [x] Better type definitions for Typescript
- [ ] Unit tests
- [ ] Add support to fields with `object` type
- [ ] Add support to async rule validation
- [ ] Support filter, such as filter out the unmodified fields, left only modified fields for form submission
- [ ] 💡 More ideas...

## Install

> ⚗️ **Experimental**

```
npm i slimeform
```

> SlimeForm only works with Vue 3

## Usage

### Form state management

Use `v-model` to bind `form[key]` on to the `<input>` element or other components.

`status` value will be changed corresponded when the form values have been modified. Use the `reset` function to reset the form values back to its initial states.

```vue
<script setup>
import { useForm } from 'slimeform'

const { form, status, reset } = useForm({
  // Initial form value
  form: () => ({
    username: '',
    password: '',
  }),
})
</script>

<template>
  <form @submit.prevent="mySubmit">
    <label>
      <!-- 这里 -->
      <input v-model="form.username" type="text">
      <input v-model="form.password" type="text">
    </label>
    <button type="submit">提交</button>
  </form>
</template>
```

#### State management

```ts
const { form, status, reset } = useForm(/* ... */)

// whether the username has been modified
status.username.isDirty
// whether the password has been modified
status.password.isDirty

// Reset form, restore form values to default
reset()
```

### Mutable initial value of form

The initial states of `useForm` could be any other variables or pinia states. The changes made to the initial values will be synced into the `form` object when the form has been resetted.

```ts
const userStore = useUserStore()

const { form, reset } = useForm({
  form: () => ({
    username: userStore.username,
    intro: userStore.intro,
  }),
})

// update the value of username and intro properties
userStore.setInfo() /** xxx info */
// changes made to the `userStore` will be synced into the `form` object,
// when reset is being called
reset()

// these properties will be the values of `userStore` where `setInfo` has been called previously
form.username
form.intro
```

### Validating rules for form

Use `rule` to define the validation rules for form fields. The verification process will be take placed automatically when values of fields have been changed, the validation result will be stored and provided in `status[key].isError` and `status[key].message` properties. If one fields requires more then one rule, it can be declared by using function arrays.

> You can also maintain your rule collections on your own, and import them where they are needed.

```ts
function isRequired(value) {
  if (value && value.trim()) {
    return true
  }

  return t('required') // i18n support
}

const { form, status, onSubmit, clearErrors } = useForm({
  // Initial form value
  form: () => ({
    name: '',
    age: '',
  }),
  // Verification rules
  rule: () => ({
    name: isRequired,
    // If one fields requires more then one rule, it can be declared by using function arrays.
    age: [
      isRequired,
      // is number
      val => !Number.isNaN(val) || 'Expected number',
      // max length
      val => val.length < 3 || 'Length needs to be less than 3',
    ],
  }),
})

function mySubmit() {
  alert(`Age: ${form.age} \n Name: ${form.name}`)
}
```

In addition, you can use any reactive values in the validation error message, such as the `t('required')` function call from `vue-i18n` as the examples shown above.

#### Manually trigger the validation

```ts
// validate the form
verify()
// validate individual fields
status.username.verify()
```

#### Manually specify error message

```ts
status.username.setError('username has been registered')
```

#### Maunally clear the errors

```ts
// clear the error for individual field
status.username.clearError()
// clear all the errors
clearErrors()
// reset will also clear the errors
reset()
```

### Suggestions

Some suggestions:

1. Use `@submit.prevent` instead of `@submit`, this can prevent the submitting action take place by form's default
2. Use `isError` to determine whether to add a red border around the form dynamically
3. Use `&nbsp;` to avoid height collapse of `<p>` when there is no messages

```vue
<template>
  <h3>Please enter your age</h3>
  <form @submit.prevent="onSubmit(mySubmit)">
    <label>
      <input
        v-model="form.age"
        type="text"
        :class="status.age.isError && '!border-red'"
      />
      <p>{{ error.age || '&nbsp;' }}</p>
    </label>
    <button type="submit">Submit</button>
  </form>
</template>
```

