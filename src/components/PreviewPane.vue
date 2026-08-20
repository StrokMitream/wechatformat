<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue'
import { hydratePreview, output } from '@/composables/useStore'

const props = defineProps<{ isCopying: boolean }>()

onMounted(() => {
  nextTick(hydratePreview)
})

watch(output, () => {
  nextTick(hydratePreview)
})
</script>

<template>
  <div class="preview-wrapper">
    <div id="output-wrapper" class="output-wrapper">
      <div class="preview">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <section id="output" class="output" v-html="output" />
        <div v-if="props.isCopying" class="loading-mask">
          <span>正在生成…</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: 24px 20px 80px;
  background: var(--app-bg);
  scrollbar-width: thin;
}

.output-wrapper {
  position: relative;
  max-width: 780px;
  margin: 0 auto;
}

.preview {
  position: relative;
  background: var(--preview-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 28px 24px;
  min-height: 60vh;
}

.output {
  width: 100%;
}

.loading-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--preview-bg) 78%, transparent);
  color: var(--text-muted);
  border-radius: 8px;
  font-size: 14px;
}
</style>
