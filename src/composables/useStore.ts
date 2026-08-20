import {
  applyTheme,
  highlightPendingBlocks,
  hljs,
  hydratePendingInfographicDiagrams,
  initRenderer,
} from '@md/core'
import { MATHJAX_READY_EVENT, postProcessHtml, renderMarkdown } from '@md/core/utils'
import {
  codeBlockThemeOptions,
  colorOptions,
  defaultStyleConfig,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
  themeOptions,
} from '@md/shared/configs'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import DEFAULT_CONTENT from '@/assets/default-content.md?raw'

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------
const STORAGE_PREFIX = `wechatformat:`

function persisted<T>(key: string, fallback: T) {
  const storageKey = STORAGE_PREFIX + key
  let initial = fallback
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw !== null)
      initial = JSON.parse(raw) as T
  }
  catch {
    // ignore malformed storage
  }
  const state = ref<T>(initial)
  watch(state, (value) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    }
    catch {
      // ignore quota / privacy-mode errors
    }
  }, { deep: true })
  return state
}

// ---------------------------------------------------------------------------
// Options exposed to the UI
// ---------------------------------------------------------------------------
export const options = {
  themeOptions,
  fontFamilyOptions,
  fontSizeOptions,
  colorOptions,
  codeBlockThemeOptions,
  legendOptions,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
export const content = persisted(`content`, DEFAULT_CONTENT)

export const theme = persisted(`theme`, defaultStyleConfig.theme)
export const primaryColor = persisted(`primaryColor`, defaultStyleConfig.primaryColor)
export const fontFamily = persisted(`fontFamily`, defaultStyleConfig.fontFamily)
export const fontSize = persisted(`fontSize`, defaultStyleConfig.fontSize)
export const codeBlockTheme = persisted(`codeBlockTheme`, defaultStyleConfig.codeBlockTheme)

export const isMacCodeBlock = persisted(`isMacCodeBlock`, defaultStyleConfig.isMacCodeBlock)
export const isShowLineNumber = persisted(`isShowLineNumber`, defaultStyleConfig.isShowLineNumber)
export const isCiteStatus = persisted(`isCiteStatus`, defaultStyleConfig.isCiteStatus)
export const isCountStatus = persisted(`isCountStatus`, defaultStyleConfig.isCountStatus)
export const isUseIndent = persisted(`isUseIndent`, false)
export const isUseJustify = persisted(`isUseJustify`, false)
export const legend = persisted(`legend`, defaultStyleConfig.legend)

export const isDark = persisted(`isDark`, false)

export const output = ref(``)
export const isCopying = ref(false)
export const readingTime = reactive({ chars: 0, words: 0, minutes: 0 })
export const titleList = ref<{ url: string, title: string, level: number }[]>([])

const fontSizeNumber = computed(() => Number(fontSize.value.replace(`px`, ``)))
export { fontSizeNumber }

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------
let renderer: ReturnType<typeof initRenderer> | null = null

function themeMode(): `light` | `dark` {
  return isDark.value ? `dark` : `light`
}

export function initRendererInstance() {
  renderer = initRenderer({
    isMacCodeBlock: isMacCodeBlock.value,
    isShowLineNumber: isShowLineNumber.value,
  })
}

function extractTitles(html: string): string {
  const headings = renderer!.getHeadings()
  titleList.value = headings.map((heading, i) => ({
    url: `#${i}`,
    title: heading.text,
    level: heading.level,
  }))

  let i = 0
  return html.replace(/data-heading="true"/g, () => `data-heading="true" id="${i++}"`)
}

export function render(options?: { themeMode?: `light` | `dark` }) {
  if (!renderer)
    initRendererInstance()

  const mode = options?.themeMode ?? themeMode()

  renderer!.reset({
    citeStatus: isCiteStatus.value,
    legend: legend.value,
    countStatus: isCountStatus.value,
    isMacCodeBlock: isMacCodeBlock.value,
    isShowLineNumber: isShowLineNumber.value,
    themeMode: mode,
  })

  const { html: baseHtml, readingTime: rt } = renderMarkdown(content.value, renderer!)

  readingTime.chars = content.value.length
  readingTime.words = rt.words
  readingTime.minutes = Math.ceil(rt.minutes)

  output.value = extractTitles(postProcessHtml(baseHtml, rt, renderer!))
  return output.value
}

/** Highlight deferred code blocks and hydrate infographic diagrams in the preview. */
export function hydratePreview() {
  const outputElement = document.getElementById(`output`)
  if (!outputElement)
    return
  highlightPendingBlocks(hljs, outputElement)
  hydratePendingInfographicDiagrams(outputElement, { themeMode: themeMode() })
}

// ---------------------------------------------------------------------------
// Theme application (inject #md-theme <style> scoped to #output)
// ---------------------------------------------------------------------------
export async function applyCurrentTheme() {
  try {
    await applyTheme({
      themeName: theme.value,
      variables: {
        primaryColor: primaryColor.value,
        fontFamily: fontFamily.value,
        fontSize: fontSize.value,
        isUseIndent: isUseIndent.value,
        isUseJustify: isUseJustify.value,
      },
    })
  }
  catch (error) {
    console.error(`[applyCurrentTheme] failed:`, error)
  }
}

/** Load / swap the highlight.js code theme stylesheet (<link id="hljs">). */
export function updateCodeTheme() {
  const cssUrl = codeBlockTheme.value
  const el = document.querySelector(`#hljs`)
  if (el) {
    if (el.getAttribute(`href`) === cssUrl)
      return
    el.setAttribute(`href`, cssUrl)
  }
  else {
    const link = document.createElement(`link`)
    link.setAttribute(`type`, `text/css`)
    link.setAttribute(`rel`, `stylesheet`)
    link.setAttribute(`href`, cssUrl)
    link.setAttribute(`id`, `hljs`)
    document.head.appendChild(link)
  }
}

// ---------------------------------------------------------------------------
// Wiring: keep preview in sync with state
// ---------------------------------------------------------------------------
let started = false

function scheduleHydrate() {
  nextTick(hydratePreview)
}

export function startStore() {
  if (started)
    return
  started = true

  initRendererInstance()
  updateCodeTheme()

  const rerender = () => {
    render()
    scheduleHydrate()
  }

  // Re-render on content or render-affecting option changes
  watch(
    [content, isMacCodeBlock, isShowLineNumber, isCiteStatus, isCountStatus, legend, isDark],
    rerender,
  )

  // Re-apply theme <style> when theme-affecting state changes
  watch(
    [theme, primaryColor, fontFamily, fontSize, isUseIndent, isUseJustify],
    () => { applyCurrentTheme() },
  )

  // Swap code highlight theme
  watch(codeBlockTheme, updateCodeTheme)

  // MathJax loads lazily; re-render once it's ready so pending formulas
  // (rendered as placeholders) are replaced with real SVG output.
  window.addEventListener(MATHJAX_READY_EVENT, () => {
    render()
    scheduleHydrate()
  })

  // Toggle the document dark class for shell UI + preview background
  watch(isDark, (dark) => {
    document.documentElement.classList.toggle(`dark`, dark)
  }, { immediate: true })

  // Initial paint
  applyCurrentTheme()
  rerender()
}
