<template>
  <div class="Material">
    <canvas id="GameCanvas" ref="GameCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { initFlappy } from '../composable/core'
export default defineComponent({
  name: 'material',
  setup() {
    const GameCanvas = ref<HTMLCanvasElement>()
    initFlappy(GameCanvas)
    return {
      GameCanvas,
    }
  },
})
</script>

<style lang="scss"></style>
