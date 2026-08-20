/// <reference path="../mathjax.d.ts" />

// Vendored locally (see public/static/libs/mathjax/) so the deployed site makes
// no external MathJax request. `import.meta.env.BASE_URL` keeps the path correct
// under any Vite `base`.
export const MATHJAX_LOCAL_URL = `${import.meta.env.BASE_URL}static/libs/mathjax/tex-svg.js`

const MATHJAX_SCRIPT_ID = `MathJax-script`

function getMathJaxScriptUrl(): string {
  return MATHJAX_LOCAL_URL
}

export const MATHJAX_READY_EVENT = `md:mathjax-ready`

let loadPromise: Promise<void> | null = null
let readyEventDispatched = false

export function isMathJaxReady(): boolean {
  return typeof window !== `undefined` && typeof window.MathJax?.tex2svg === `function`
}

function waitForMathJaxStartup(): Promise<void> {
  const startup = window.MathJax?.startup?.promise
  return startup ?? Promise.resolve()
}

function removeMathJaxScript() {
  document.getElementById(MATHJAX_SCRIPT_ID)?.remove()
}

function appendMathJaxScript(): HTMLScriptElement {
  removeMathJaxScript()

  const script = document.createElement(`script`)
  script.id = MATHJAX_SCRIPT_ID
  script.src = getMathJaxScriptUrl()
  document.head.appendChild(script)
  return script
}

export function loadMathJax(): Promise<void> {
  if (typeof window === `undefined`)
    return Promise.resolve()

  if (isMathJaxReady())
    return Promise.resolve()

  if (loadPromise)
    return loadPromise

  loadPromise = new Promise<void>((resolve, reject) => {
    Object.assign(window, {
      MathJax: {
        tex: { tags: `ams` },
        svg: { fontCache: `none` },
        // Render via tex2svg in preview only; disable page scan or CodeMirror $$...$$ gets rewritten
        startup: {
          typeset: false,
        },
        options: {
          ignoreHtmlClass: `mathjax-ignore`,
        },
      },
    })

    const script = appendMathJaxScript()
    script.onload = () => {
      waitForMathJaxStartup().then(resolve).catch((error) => {
        removeMathJaxScript()
        loadPromise = null
        reject(error)
      })
    }
    script.onerror = () => {
      removeMathJaxScript()
      loadPromise = null
      reject(new Error(`Failed to load MathJax`))
    }
  })

  return loadPromise
}

export function ensureMathJaxLoaded(): Promise<void> {
  const wasReady = isMathJaxReady()
  return loadMathJax().then(() => {
    if (typeof window === `undefined` || wasReady || readyEventDispatched)
      return
    readyEventDispatched = true
    window.dispatchEvent(new CustomEvent(MATHJAX_READY_EVENT))
  })
}
