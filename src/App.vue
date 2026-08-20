<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EditorHeader from '@/components/EditorHeader.vue'
import EditorPane from '@/components/EditorPane.vue'
import PreviewPane from '@/components/PreviewPane.vue'
import { isCopying, startStore } from '@/composables/useStore'

type ViewMode = 'both' | 'edit' | 'preview'
const viewMode = ref<ViewMode>(`both`)

onMounted(() => {
  startStore()
})
</script>

<template>
  <EditorHeader v-model:view-mode="viewMode" />

  <main class="workbench" :class="`mode-${viewMode}`">
    <section v-show="viewMode !== 'preview'" class="pane editor-col">
      <EditorPane />
    </section>
    <section v-show="viewMode !== 'edit'" class="pane preview-col">
      <PreviewPane :is-copying="isCopying" />
    </section>
  </main>

  <footer class="seo-footer">
    <p>
      <strong>WeChat Format</strong> — 免费在线 Markdown 编辑器（Markdown editor）、Markdown 预览器（Markdown viewer / preview）。
      在浏览器中在线（online）编写与预览 Markdown，支持语法高亮、多主题排版、数学公式与图表，一键复制到微信公众号。
    </p>
    <nav class="seo-links">
      <a href="/about">关于</a>
      <a href="/terms">服务条款</a>
      <a href="/privacy">隐私政策</a>
      <a href="https://github.com/StrokMitream/wechatformat" target="_blank" rel="noopener">GitHub</a>
    </nav>
  </footer>
</template>

<style scoped>
.workbench {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
  overflow: hidden;
}

.workbench.mode-edit,
.workbench.mode-preview {
  grid-template-columns: 1fr;
}

.pane {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.editor-col {
  border-right: 1px solid var(--panel-border);
}

.seo-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 16px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
  background: var(--header-bg);
  border-top: 1px solid var(--panel-border);
  max-height: 44px;
  overflow: hidden;
}

.seo-footer p {
  margin: 0;
  flex: 1;
  min-width: 0;
}

.seo-links {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  white-space: nowrap;
}

.seo-links a {
  color: var(--text-muted);
  text-decoration: none;
}

.seo-links a:hover {
  color: var(--accent);
}

@media (max-width: 720px) {
  .workbench {
    grid-template-columns: 1fr;
  }

  .workbench.mode-both {
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr;
  }

  .editor-col {
    border-right: none;
    border-bottom: 1px solid var(--panel-border);
  }

  .seo-footer {
    display: none;
  }
}
</style>
