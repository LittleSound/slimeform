<script setup lang="ts">
const name = $ref('')

const router = useRouter()
const go = () => {
  if (name)
    router.push(`/hi/${encodeURIComponent(name)}`)
}
</script>

<template>
  <div>
    <div h-20 inline-block>
      <img src="/favicon.svg" h-full>
    </div>
    <p text-2xl>
      <a rel="noreferrer" href="https://github.com/LittleSound/slimeform" target="_blank">
        Slimeform
      </a>
    </p>
    <p>
      <em text-base op75>Form state management and validation for Vue3</em>
    </p>

    <div py-4 />

    <Demo />

    <div py-4 />

    <input
      id="input"
      v-model="name"
      placeholder="What's your name?"
      type="text"
      autocomplete="false"
      p="x-4 y-2"
      w="250px"
      text="center"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
      @keydown.enter="go"
    >

    <div>
      <button
        class="m-3 text-sm btn"
        :disabled="!name"
        @click="go"
      >
        Go
      </button>
    </div>
  </div>
</template>
