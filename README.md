<br>
<br>
<br>

<p align="center">
  <img height="80px" src="https://github.com/LittleSound/slimeform/raw/main/example/public/favicon.svg">
</p>

<h1 align="center">SlimeForm</h1>
<p align="center">English | <a href="https://github.com/LittleSound/slimeform/blob/HEAD/README.zh-Hans.md">简体中文</a></p>

<!-- 一些美丽的标签 -->
<p align="center">
  <a href="https://www.npmjs.com/package/slimeform">
    <img alt="npm" src="https://badgen.net/npm/v/slimeform">
  </a>
  <a href="https://github.com/LittleSound/slimeform/actions/workflows/test.yaml">
    <img alt="Test" src="https://github.com/LittleSound/slimeform/actions/workflows/test.yaml/badge.svg">
  </a>
  <a href="#try-it-online">
    <img alt="docs" src="https://img.shields.io/badge/-docs%20%26%20demos-1e8a7a">
  </a>
</p>

<br>

Form state management and validation

## Why?

We usually use all sorts of different pre-made form components in vue projects which may be written by ourselves, or come from other third-party UI libraries. As for those third-party UI libraries, they might shipped their own form validators with libraries, however we still will need to build our form validators for those components written by us. In most of the time, those form validators were not 'unified' or we say compatible to the others, especially when you mixed your own components with third-party components together in one project where thing might become tricky.

Base on modern CSS utilities class and component-based design, it has now become way more easier to write your own `<input>` component in specific style and assemble them as a form, however, when you need to integrate form state management and rule validation with all the related input fields, the problem will be more complex.

So I started to experiment a solution to achieve this kind of functionalities, and naming it with SlimeForm, which means this utilities would try it best to fit in the forms just like the slime does 💙.

SlimeForm is a form state management and validator which is **dependency free**, **no internal validation rules shipped and required**. By binding all native or custom components through `v-model`, SlimeForm is able to manage and validate values reactively.

## TODO

- [x] Improve the functionalities
  - [x] Use reactive type to return the form
  - [x] For a single rule, the array can be omitted
  - [x] Mark whether the value of the form has been modified
- [x] Documentations
- [x] Better type definitions for Typescript
- [x] Unit tests
- [x] Add support to fields with `object` type
- [ ] Add support to async rule validation
- [x] Support filtering the unmodified entries in the form, leaving only the modified entries for submission
- [ ] Support for third-party rules, such as [yup](https://github.com/jquense/yup)
  - [x] Support `validateSync`
  - [ ] Support `validate` (Async)
- [ ] 💡 More ideas...

### Contributions are welcomed

## Try it online

🚀 [slimeform-playground](https://stackblitz.com/edit/vitejs-vite-4eppne?file=package.json,src%2FApp.vue,src%2Fcomponents%2FHeader.vue,src%2Fcomponents%2FDemo.vue&terminal=dev)

## Install

> ⚗️ **Experimental**

```shell
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

const { form, status, reset, dirtyFields } = useForm({
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
      <!-- here -->
      <input v-model="form.username" type="text">
      <input v-model="form.password" type="text">
    </label>
    <button type="submit">Submit</button>
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

// Reset the specified field
reset('username', 'password', /* ... */)
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
userStore.setInfo(/* ... */)
// changes made to the `userStore` will be synced into the `form` object,
// when reset is being called
reset()

// these properties will be the values of `userStore` where `setInfo` has been called previously
form.username
form.intro
```

### Filtering out modified fields

Suppose you are developing a form to edit existing data, where the user usually only modifies some of the fields, and then the front-end submits the modified fields to the back-end via
[HTTP  PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH) to submit the user-modified part of the fields to the backend, and the backend will partially update based on which fields were submitted

Such a requirement can use the `dirtyFields` computed function, whose value is an object that only contains the modified fields in the `form`.

```ts
const { form: userInfo, status, dirtyFields } = useForm(/* ... */)

dirtyFields.value /* value: {} */

// Edit user intro
userInfo.intro = 'abcd'

dirtyFields.value /* value: { intro: 'abcd' } */

// Edit user profile to default
userInfo.intro = '' /* default value */

dirtyFields.value /* value: {} */
```

### Validating rules for form

Use `rule` to define the validation rules for form fields. The verification process will be take placed automatically when values of fields have been changed, the validation result will be stored and provided in `status[key].isError` and `status[key].message` properties. If one fields requires more then one rule, it can be declared by using function arrays.

> You can also maintain your rule collections on your own, and import them where they are needed.

```ts
// formRules.ts
function isRequired(value) {
  if (value && value.trim()) {
    return true
  }

  return t('required') // i18n support
}
```

```vue
<script setup>
import { isRequired } from '~/util/formRules.ts'
const {
  form,
  status,
  onSubmit,
  clearErrors,
  isError,
  verify
} = useForm({
  // Initial form value
  form: () => ({
    name: '',
    age: '',
  }),
  // Verification rules
  rule: {
    name: isRequired,
    // If one fields requires more then one rule, it can be declared by using function arrays.
    age: [
      isRequired,
      // is number
      val => !Number.isNaN(val) || 'Expected number',
      // max length
      val => val.length < 3 || 'Length needs to be less than 3',
    ],
  },
})

function mySubmit() {
  alert(`Age: ${form.age} \n Name: ${form.name}`)
}
</script>

<template>
  <form @submit.prevent="onSubmit(mySubmit)">
    <!-- ... -->
  </form>
</template>
```

In addition, you can use any reactive values in the validation error message, such as the `t('required')` function call from `vue-i18n` as the examples shown above.

<details><summary>Manually trigger the validation</summary>
<p>

```ts
const { _, status, verify } = useForm(/* ... */)
// validate the form
verify()
// validate individual fields
status.username.verify()
```

</p>
</details>

<details><summary>Manually specify error message</summary>
<p>

```ts
status.username.setError('username has been registered')
```

</p>
</details>

<details><summary>Maunally clear the errors</summary>
<p>

```ts
const { _, status, clearErrors, reset } = useForm(/* ... */)
// clear the error for individual field
status.username.clearError()
// clear all the errors
clearErrors()
// reset will also clear the errors
reset()
```

</p>
</details>

<details><summary>Any errors</summary>
<p>

`isError`: Are there any form fields that contain incorrect validation results

```ts
const { _, isError } = useForm(/* ... */)

isError /* true / false */
```

</p>
</details>

<details><summary>Default message for form</summary>
<p>

Use `defaultMessage` to define a placeholders for the form field validation error message. The default value is `''`, you can set it to `\u00A0`, which will be escaped to `&nbsp;` during rendering, to avoid the height collapse problem of `<p>` when there is no messages.

```ts
const { form, status } = useForm({
  form: () => ({/* ... */}),
  rule: {/* ... */},
  // Placeholder content when there are no error message
  defaultMessage: '\u00A0',
})
```

</p>
</details>

## Integrations

### Using Yup as a rule

If you don't want to write the details of validation rules yourself, there is already a very clean way to use [Yup](https://github.com/jquense/yup) as a rule.

SlimeForm has a built-in resolvers for [Yup](https://github.com/jquense/yup) synchronization rules: `yupFieldRule`, which you can import from `slimeform/resolvers`. `yupFieldRule` function internally calls `schema.validateSync` method and processes the result in a format acceptable to SlimeForm.

**First, you have to install [Yup](https://github.com/jquense/yup)**

```sh
npm install yup
```

then import `yup` and `yupFieldRule` into your code and you're ready to go!

```ts
import { useForm } from 'slimeform'
import * as yup from 'yup'

/* Importing a resolvers */
import { yupFieldRule } from 'slimeform/resolvers'

const { t } = useI18n()

const { form, status } = useForm({
  form: () => ({ age: '' }),
  rule: {
    /* Some use cases */
    age: [
      yupFieldRule(yup.string()
        .required(),
      ),
      yupFieldRule(yup.number()
        .max(120, () => t('xxx_i18n_key'))
        .integer()
        .nullable(),
      ),
    ],
  },
})
```

## Suggestions

Some suggestions:

1. Use `@submit.prevent` instead of `@submit`, this can prevent the submitting action take place by form's default
2. Use `isError` to determine whether to add a red border around the form dynamically

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
      <p>{{ status.age.message }}</p>
    </label>
    <button type="submit">Submit</button>
  </form>
</template>
```
