<script setup lang="ts">
import { ref } from 'vue'
import { copyHtml } from '@/lib/clipboard'
import {
  codeBlockTheme,
  fontFamily,
  fontSize,
  isCiteStatus,
  isCopying,
  isCountStatus,
  isDark,
  isMacCodeBlock,
  isShowLineNumber,
  legend,
  options,
  primaryColor,
  render,
  theme,
} from '@/composables/useStore'
import { processClipboardContent } from '@/services/export/clipboard'

defineProps<{ viewMode: 'both' | 'edit' | 'preview' }>()
const emit = defineEmits<{ (e: 'update:viewMode', v: 'both' | 'edit' | 'preview'): void }>()

const status = ref(``)
let statusTimer: number | undefined

function flash(message: string) {
  status.value = message
  window.clearTimeout(statusTimer)
  statusTimer = window.setTimeout(() => (status.value = ``), 2200)
}

async function copyForWeChat() {
  if (isCopying.value)
    return
  isCopying.value = true
  try {
    const wasDark = isDark.value
    const { html, plainText, hasPendingAsyncContent } = await processClipboardContent(
      primaryColor.value,
      wasDark
        ? {
            renderLight: () => render({ themeMode: `light` }),
            restore: () => render({ themeMode: `dark` }),
          }
        : undefined,
    )
    if (!html) {
      flash(`复制失败：预览为空`)
      return
    }
    await copyHtml(html, plainText)
    flash(hasPendingAsyncContent ? `已复制（部分图表仍在渲染）` : `已复制，可粘贴到公众号`)
  }
  catch (error) {
    console.error(error)
    flash(`复制失败`)
  }
  finally {
    isCopying.value = false
  }
}

function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<template>
  <header class="header">
    <div class="brand">
      <img src="/favicon.svg" alt="logo" class="logo">
      <span class="title">Markdown 编辑器</span>
    </div>

    <div class="controls">
      <label class="ctrl">
        <span>主题</span>
        <select v-model="theme">
          <option v-for="o in options.themeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>

      <label class="ctrl">
        <span>字体</span>
        <select v-model="fontFamily">
          <option v-for="o in options.fontFamilyOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>

      <label class="ctrl">
        <span>字号</span>
        <select v-model="fontSize">
          <option v-for="o in options.fontSizeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>

      <label class="ctrl">
        <span>主题色</span>
        <select v-model="primaryColor">
          <option v-for="o in options.colorOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>

      <label class="ctrl">
        <span>代码</span>
        <select v-model="codeBlockTheme">
          <option v-for="o in options.codeBlockThemeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>

      <label class="ctrl">
        <span>图注</span>
        <select v-model="legend">
          <option v-for="o in options.legendOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>

      <div class="toggles">
        <label><input v-model="isMacCodeBlock" type="checkbox"> Mac 代码块</label>
        <label><input v-model="isShowLineNumber" type="checkbox"> 行号</label>
        <label><input v-model="isCiteStatus" type="checkbox"> 引用链接</label>
        <label><input v-model="isCountStatus" type="checkbox"> 字数</label>
      </div>
    </div>

    <div class="actions">
      <span v-if="status" class="status">{{ status }}</span>

      <div class="view-toggle">
        <button :class="{ active: viewMode === 'edit' }" title="仅编辑" @click="emit('update:viewMode', 'edit')">编辑</button>
        <button :class="{ active: viewMode === 'both' }" title="双栏" @click="emit('update:viewMode', 'both')">双栏</button>
        <button :class="{ active: viewMode === 'preview' }" title="仅预览" @click="emit('update:viewMode', 'preview')">预览</button>
      </div>

      <button class="icon-btn" :title="isDark ? '浅色模式' : '深色模式'" @click="toggleDark">
        {{ isDark ? '☀' : '☾' }}
      </button>

      <button class="copy-btn" :disabled="isCopying" @click="copyForWeChat">
        {{ isCopying ? '生成中…' : '复制到公众号' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--panel-border);
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  flex-shrink: 0;
}

.logo {
  width: 24px;
  height: 24px;
}

.title {
  font-size: 15px;
  white-space: nowrap;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px 14px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.ctrl {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-muted);
}

.ctrl select {
  font-size: 12px;
  padding: 4px 6px;
  color: var(--text);
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 6px;
  max-width: 120px;
}

.toggles {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.toggles label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  cursor: pointer;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

.status {
  font-size: 12px;
  color: var(--accent);
  white-space: nowrap;
}

.view-toggle {
  display: inline-flex;
  border: 1px solid var(--control-border);
  border-radius: 6px;
  overflow: hidden;
}

.view-toggle button {
  border: none;
  background: var(--control-bg);
  color: var(--text-muted);
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
}

.view-toggle button.active {
  background: var(--accent);
  color: #fff;
}

.icon-btn {
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 6px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 14px;
}

.icon-btn:hover {
  background: var(--control-hover);
}

.copy-btn {
  border: none;
  background: var(--accent);
  color: #fff;
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.copy-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.copy-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

@media (max-width: 720px) {
  .toggles {
    display: none;
  }
}
</style>
