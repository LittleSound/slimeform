<br>
<br>
<br>

<p align="center">
  <img height="80px" src="https://github.com/LittleSound/slimeform/raw/main/example/public/favicon.svg">
</p>

<h1 align="center">SlimeForm</h1>
<p align="center"><a href="https://github.com/LittleSound/slimeform">English</a> | 简体中文</p>

<br>


表单状态管理和数值校验

## 安装

> ⚗️ **实验性**

```
npm i slimeform
```

> SlimeForm 仅支持 Vue 3

## 使用方式

### 表单状态管理

将 `form` 用 `v-model` 绑定到 `<input>` 或是其他组件。
值改变时 `status` 会产生对应的变化；使用 reset 方法重置表单的值到初始状态。

```ts
const { form, status, reset } = useForm({
  // 初始的 form 值
  form: () => ({
    username: '',
    password: '',
  }),
})

// username 是否已经被修改
status.username.isDirty
// password 是否已经被修改
status.password.isDirty

// 重置表单, 恢复到初始状态
reset()
```
### 可变的初始 form 值

`useForm` 的表单初始值可以其它变量或 pinia 的状态，初始值的改变将在表单重置时同步到 `form` 对象中

```ts
const userStore = useUserStore()

const { form, reset } = useForm({
  form: () => ({
    username: userStore.username,
    intro: userStore.intro,
  }),
})

// 假设我们调用 setInfo 函数更新了 username 和 intro 的值
userStore.setInfo() /** xxx info */
// 在调用 reset 时，对 `userStore` 所做的更改将同步到 `form` 对象中
reset()

// 这些属性将是之前调用过 `setInfo` 之后 `userStore` 的值
form.username
form.intro
```

### 表单规则校验

使用 `rule` 定义表单字段的验证规则。当字段值发生更改时，验证过程将自动进行，验证结果将会存储和呈现在 `status[key].isError` 和 `status[key].message` 属性中。
如果一个字段需要多个规则，可以使用函数数组来声明。

> 你可以维护自己的规则集，并在需要使用的地方导入。

```ts
function isRequired(value) {
  if (value && value.trim())
    return true

  return t('required') // i18n 支持
}

const { form, status, onSubmit, clearErrors } = useForm({
  // 初始 form 值
  form: () => ({
    name: '',
    age: '',
  }),
  // 进行校验
  rule: () => ({
    name: isRequired,
    // 如果一个字段有多条规则，可以使用数组
    age: [
      isRequired,
      // 要求字段是数字 number
      val => !Number.isNaN(val) || 'Expected number',
      // 要求字段有最大值
      val => val.length < 3 || 'Length needs to be less than 3',
    ],
  }),
})

function mySubmit() {
  alert(`Age: ${form.age} \n Name: ${form.name}`)
}
```

此外，您可以在验证错误消息中使用任何响应式的值，例如如上所示，对 `vue-i18n` 库的多语言函数 `t('required')` 的调用。

#### 手动触发校验

```ts
// 表单校验
verify()
// 字段校验
status.username.verify()
```

#### 手动指定错误

```ts
status.username.setError('username has been registered')
```

#### 清除错误

```ts
// 清除字段的错误
status.username.clearError()
// 清除全部错误
clearErrors()
// 重置表单也会清除错误
reset()
```

### 建议

一些建议：
1. 使用 `@submit.prevent` 而不是 `@submit` 来屏蔽表单默认提交行为
2. 使用 `isError` 的值来动态地判断是否需要给表单输入框添加红色的描边
3. 使用 `&nbsp;` 来避免没有 message 时 `<p>` 出现高度塌陷的问题

```vue
<template>
  <h3>请输入你的年龄</h3>
  <form @submit.prevent="onSubmit(mySubmit)">
    <label>
      <input
        v-model="form.age"
        type="text"
        :class="status.age.isError && '!border-red'"
      >
      <p>{{ error.age || '&nbsp;' }}</p>
    </label>
    <button type="submit">
      提交
    </button>
  </form>
</template>
```
