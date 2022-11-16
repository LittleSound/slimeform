<br>
<br>
<br>

<p align="center">
  <img height="80px" src="https://github.com/LittleSound/slimeform/raw/main/example/public/favicon.svg">
</p>

<h1 align="center">SlimeForm</h1>
<p align="center"><a href="https://github.com/LittleSound/slimeform">English</a> | 简体中文</p>

<!-- 一些美丽的标签 -->
<p align="center">
  <a href="https://www.npmjs.com/package/slimeform">
    <img alt="Test" src="https://badgen.net/npm/v/slimeform">
  </a>
  <a href="https://github.com/LittleSound/slimeform/actions/workflows/test.yaml">
    <img alt="Test" src="https://github.com/LittleSound/slimeform/actions/workflows/test.yaml/badge.svg">
  </a>
  <a href="#在线尝试">
    <img alt="docs" src="https://img.shields.io/badge/-docs%20%26%20demos-1e8a7a">
  </a>
</p>

<br>

表单状态管理和数值校验

## 由来

在 Vue 项目中，我们经常会使用各种预制的表单组件，它可能是自己编写的，或者来自第三方 UI 库。对于第三方 UI 库而言，它们可能有自己的表单校验器，而自己的组件则需要自己编写表单校验器，很多时候这些表单的校验器是不统一的，尤其是当你在项目中混合使用第三方 UI 库 和自己的组件时，将它们结合在一起会十分困难。

基于现代 CSS 工具类和组件化，编写自己风格的 `<input>` 组件并将它们组合成表单十分容易，然而在涉及到需要整合所有输入相关的表单状态管理和规则校验时，问题就变得复杂起来了。

因此我开始为满足这一需求而对一个解决方案进行实验，并将其取名为 SlimeForm，含义为像史莱姆一样嵌入并粘粘所有表单 💙。

SlimeForm 是一个**无组件**、**无内置规则**的表单状态管理器和验证器，通过 `v-model` 绑定所有的原生或自定义组件，并响应式地管理以及验证它们。

## 待办事项

- [x] 改进功能
  - [x] 使用 `reactive` 类型返回表单
  - [x] 对于单个规则，可以省略数组
  - [x] 使用 `status[key].isDirty` 标记表单的值是否被修改
- [x] 文档
- [x] 更好的 Typescript 类型定义
- [x] 单元测试
- [x] 添加对  `object` 类型字段的支持
- [ ] 添加对异步规则的支持
- [x] 支持过滤未修改的条目，只留下已经修改的条目进行提交
- [ ] 支持第三方规则，比如 [yup](https://github.com/jquense/yup)
  - [x] 支持 `validateSync`
  - [ ] 支持 `validate`（异步）
- [ ] 💡 更多的点子

### 欢迎贡献

## 在线尝试

🚀 [slimeform-playground](https://stackblitz.com/edit/vitejs-vite-4eppne?file=package.json,src%2FApp.vue,src%2Fcomponents%2FHeader.vue,src%2Fcomponents%2FDemo.vue&terminal=dev)

## 安装

> ⚗️ **实验性**

```shell
npm i slimeform
```

> SlimeForm 仅支持 Vue 3

## 使用方式

### 表单状态管理

将 `form` 用 `v-model` 绑定到 `<input>` 或是其他组件。
值改变时 `status` 会产生对应的变化；使用 reset 方法重置表单的值到初始状态。

```vue
<script setup>
import { useForm } from 'slimeform'

const { form, status, reset, dirtyFields } = useForm({
  // 初始的 form 值
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

#### 状态管理

```ts
const { form, status, reset } = useForm(/* ... */)

// username 是否已经被修改
status.username.isDirty
// password 是否已经被修改
status.password.isDirty

// 重置表单, 恢复到初始状态
reset()

// 重置指定字段
reset('username', 'password', /* ... */)
```

### 可变的初始 form 值

`useForm` 的表单初始值可以是其它变量或 pinia 的状态，初始值的改变将在表单重置时同步到 `form` 对象中

```ts
const userStore = useUserStore()

const { form, reset } = useForm({
  form: () => ({
    username: userStore.username,
    intro: userStore.intro,
  }),
})

// 假设我们调用 setInfo 函数更新了 username 和 intro 的值
userStore.setInfo(/* ... */)
// 在调用 reset 时，对 `userStore` 所做的更改将同步到 `form` 对象中
reset()

// 这些属性将是之前调用过 `setInfo` 之后 `userStore` 的值
form.username
form.intro
```

### 筛选出已修改的字段

假设你正在开发一个对现有数据进行编辑的表单，用户通常只会修改其中的部分字段，然后前端会通过 [HTTP  PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH) 将用户修改过的那部分字段提交给后端，后端依据提交了哪些字段进行局部更新

此类需求可以使用  `dirtyFields` 计算函数，它的值是一个只会包含 `form` 当中被修改过字段的对象。

```ts
const { form: userInfo, status, dirtyFields } = useForm(/* ... */)

dirtyFields.value /* value: {} */

// 编辑用户简介
userInfo.intro = 'abcd'

dirtyFields.value /* value: { intro: 'abcd' } */

// 编辑用户简介为默认值
userInfo.intro = '' /* default value */

dirtyFields.value /* value: {} */
```

### 表单规则校验

使用 `rule` 定义表单字段的验证规则。当字段值发生更改时，验证过程将自动进行，验证结果将会存储和呈现在 `status[key].isError` 和 `status[key].message` 属性中。
如果一个字段需要多个规则，可以使用函数数组来声明。

> 你可以维护自己的规则集，并在需要使用的地方导入。

```ts
// formRules.ts
export function isRequired(value) {
  if (value && value.trim()) {
    return true
  }

  return t('required') // i18n 支持
}
```

```vue
<script setup>
import { isRequired } from '~/util/formRules.ts'
const {
  form,
  status,
  submitter,
  clearErrors,
  isError,
  verify
} = useForm({
  // 初始 form 值
  form: () => ({
    name: '',
    age: '',
  }),
  // 进行校验
  rule: {
    name: isRequired,
    // 如果一个字段有多条规则，可以使用数组
    age: [
      isRequired,
      // 要求字段是数字 number
      val => !Number.isNaN(val) || 'Expected number',
      // 要求字段有最大值
      val => val.length < 3 || 'Length needs to be less than 3',
    ],
  },
})

const { submit } = submitter(() => {
  alert(`Age: ${form.age} \n Name: ${form.name}`)
})
</script>

<template>
  <form @submit.prevent="submit">
    <!-- ... -->
  </form>
</template>
```

此外，您可以在验证错误消息中使用任何响应式的值，例如如上所示，对 `vue-i18n` 库的多语言函数 `t('required')` 的调用。

<details><summary>手动触发校验</summary>
<p>

```ts
const { _, status, verify } = useForm(/* ... */)
// 表单校验
verify()
// 字段校验
status.username.verify()
```

</p>
</details>

<details><summary>手动指定错误</summary>
<p>

```ts
status.username.setError('username has been registered')
```

</p>
</details>

<details><summary>清除错误</summary>
<p>

```ts
const { _, status, clearErrors, reset } = useForm(/* ... */)
// 清除字段的错误
status.username.clearError()
// 清除全部错误
clearErrors()
// 重置表单也会清除错误
reset()
```

</p>
</details>

<details><summary>任何错误</summary>
<p>

`isError`: 是否有任何表单字段包含错误的验证结果

```ts
const { _, isError } = useForm(/* ... */)

isError /* true / false */
```

</p>
</details>

<details><summary>表单校验信息占位内容</summary>
<p>

使用 `defaultMessage` 定义表单字段校验信息的占位内容。默认值为 `''`，你可以将它设置为 `\u00A0`，在渲染时会被转义为 `&nbsp;`，以此来避免没有 message 时 `<p>` 出现高度坍塌问题。

```ts
const { form, status } = useForm({
  form: () => ({/* ... */}),
  rule: {/* ... */},
  // 没有错误消息时的占位内容
  defaultMessage: '\u00A0',
})
```

</p>
</details>

<details><summary>规则懒校验</summary>
<p>

将 `lazy` 设置为 `true` 可以阻止数据变化时规则自动校验。

此时, 可以考虑调用 `verify()` 或 `status[fieldName].verify()` 来手动校验字段。

```ts
const { form, status, verify } = useForm({
  form: () => ({
    userName: '',
    /* ... */
  }),

  rule: {
    userName: v => v.length < 3,
  },

  lazy: true,
})

form.userName = 'abc'
status.userName.isError // false

verify()

status.userName.isError // true
```

</p>
</details>

<details><summary><code>useForm()</code> 返回的 <code>rule</code></summary>
<p>

Slimeform 在 `useForm()` 的返回值中提供了 `rule`, 该字段可以校验表单外的数据。如果您想确保数据在传入表单之前一定是满足规则的，那么这个字段是很有用的。

```ts
const { form, rule } = useForm({
  form: () => ({
    userName: '',
    /* ... */
  }),

  rule: {
    userName: v => v.length < 3 || 'to many characters',
  },
})

const myUserName = 'abcd'
if (rule.userName.validate(myUserName) === true) {
  form.userName = myUserName // won't pass into form
}
```

</p>
</details>

### 提交

`submitter` 接受一个回调函数参数，返回触发这个回调函数的函数和表示函数运行中的状态变量；传入 `submitter` 的回调函数可以拿到 `useForm` 函数返回的所有状态和函数，这样可以将回调函数放到单独的代码中，甚至编写通用的提交函数，方便组合使用。

```vue
<script setup>
import { useForm } from 'slimeform'

const { _, submitter } = useForm(/* ... */)

// Define the submit function
const {
  // trigger submit callback
  submit,
  // Indicates whether the asynchronous commit function is executing
  submitting,
} = submitter(async ({ form, status, isError, reset /* ... */ }) => {
  // Submission Code
  const res = await fetch(/* ... */)
  // ....
})
</script>

<template>
  <form @submit.prevent="submit">
    <!-- ... -->

    <!-- Use `submitting` to disable buttons and add loading indicator -->
    <button type="submit" :disabled="submitting">
      <icon v-if="submitting" name="loading" />
      Submit
    </button>
  </form>
</template>
```

默认情况下调用 `submit` 函数后会先进行表单规则验证，如果验证失败，将会直接结束函数执行，如果需要关闭此行为可以在 `submitter` 函数的第二个参数参数 `options` 中配置 `enableVerify: false` 来跳过验证。

#### 包装通用提交函数并使用

```ts
import { mySubmitForm } from './myFetch.ts'
const { _, submitter } = useForm(/* ... */)
// Wrap the generic submission code and use it later
const { submit, submitting } = submitter(mySubmitForm({ url: '/register', method: 'POST' }))
```

## 集成

### 使用 Yup 作为规则

如果你不想自己编写验证规则的细节，已经有一种非常简洁的方法可以使用 [Yup](https://github.com/jquense/yup) 作为规则。

SlimeForm 内置了 [Yup](https://github.com/jquense/yup) 同步规则的解析器：`yupFieldRule`，你可以从 `slimeform/resolvers` 导入它。`yupFieldRule` 函数在内部调用 `schema.validateSync` 方法，并处理结果为 SlimeForm 可接受的格式。

**首先，你要安装 [Yup](https://github.com/jquense/yup)**

```sh
npm install yup
```

然后在代码中导入 `yup` 和 `yupFieldRule` 就可以使用了

```ts
import { useForm } from 'slimeform'
import * as yup from 'yup'

/* 导入解析器 */
import { yupFieldRule } from 'slimeform/resolvers'

const { t } = useI18n()

const { form, status } = useForm({
  form: () => ({ age: '' }),
  rule: {
    /* 一些使用案例 */
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

## 建议

一些建议：

1. 使用 `@submit.prevent` 而不是 `@submit` 来屏蔽表单默认提交行为
2. 使用 `isError` 的值来动态地判断是否需要给表单输入框添加红色的描边

```vue
<template>
  <h3>请输入你的年龄</h3>
  <form @submit.prevent="submitFn">
    <label>
      <input
        v-model="form.age"
        type="text"
        :class="status.age.isError && '!border-red'"
      >
      <p>{{ status.age.message }}</p>
    </label>
    <button type="submit">
      提交
    </button>
  </form>
</template>
```
