<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import Demo from '~/components/demo.vue'
</script>

<template>
  <div class="text-center mt-20">
    <Demo />
  </div>
</template>

<style>
@import './assets/base.css';

.mt-20 {
  margin-top: 20px;
}

.text-center {
  text-align: center;
}
</style>
