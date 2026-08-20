<script setup lang="ts">
import { markdownSetup, theme } from '@md/shared/editor'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { content, isDark } from '@/composables/useStore'

const host = ref<HTMLDivElement>()
let view: EditorView | null = null
const themeCompartment = new Compartment()

onMounted(() => {
  const state = EditorState.create({
    doc: content.value,
    extensions: [
      markdownSetup({ placeholder: `在此输入 Markdown …` }),
      themeCompartment.of(theme(isDark.value)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const next = update.state.doc.toString()
          if (next !== content.value)
            content.value = next
        }
      }),
    ],
  })

  view = new EditorView({ state, parent: host.value! })

  // Keep the editor in sync when content changes externally (e.g. "clear" / reset)
  watch(content, (value) => {
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      })
    }
  })

  watch(isDark, (dark) => {
    view?.dispatch({ effects: themeCompartment.reconfigure(theme(dark)) })
  })
})

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})
</script>

<template>
  <div ref="host" class="editor-host" />
</template>

<style scoped>
.editor-host {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--panel-bg);
}
</style>
