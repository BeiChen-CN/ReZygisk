import { exec } from '../kernelsu.js'
import { setDarkNav } from './darkNavbar.js'
import {
  light_close_icon,
  light_expand_icon,
  light_page_exit_icon,
} from './lightIcon.js'
import { setLightNav } from './lightNavbar.js'

const rootCss = document.querySelector(':root')

/* INFO: Changes the icons to match the theme */
const close_icons = document.getElementsByClassName('close_icon')
const expand_icons = document.getElementsByClassName('expander')
const sp_lang_close = document.getElementById('sp_lang_close')
const sp_theme_close = document.getElementById('sp_theme_close')
const sp_errorh_close = document.getElementById('sp_errorh_close')

const FALLBACK_SEED = '#1b6ef3'
const CACHE_KEY = '/system/material_you_seed'

/* INFO: HSL color utilities */
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }

  return [h * 360, s * 100, l * 100]
}

function hslToHex(h, s, l) {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }

  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

/* INFO: Generate a tonal palette from seed color */
function generateTone(hue, saturation, tone) {
  return hslToHex(hue, Math.min(saturation, 50), tone)
}

function generatePalette(seedHex) {
  const [h, s] = hexToHsl(seedHex)

  return {
    /* Light scheme tones */
    light: {
      background: generateTone(h, s, 98),
      surface: generateTone(h, s, 96),
      container: generateTone(h, s, 94),
      containerHigh: generateTone(h, s, 90),
      primary: generateTone(h, s, 40),
      text: generateTone(h, s, 10),
      textVariant: generateTone(h, s, 35),
      outline: generateTone(h, s, 80),
      error: '#b3261e',
      button: generateTone(h, s, 85),
      navbar: generateTone(h, s, 96),
      navicon: generateTone(h, s, 92),
    },
    /* Dark scheme tones */
    dark: {
      background: generateTone(h, s, 6),
      surface: generateTone(h, s, 10),
      container: generateTone(h, s, 14),
      containerHigh: generateTone(h, s, 18),
      primary: generateTone(h, s, 80),
      text: generateTone(h, s, 90),
      textVariant: generateTone(h, s, 65),
      outline: generateTone(h, s, 30),
      error: '#f2b8b5',
      button: generateTone(h, s, 10),
      navbar: generateTone(h, s, 12),
      navicon: generateTone(h, s, 18),
    },
  }
}

/* INFO: Extract system accent color via shell commands */
async function extractSeedColor() {
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) return cached

  const strategies = [
    {
      cmd: 'cmd overlay dump com.android.systemui 2>/dev/null | grep system_accent1_500 | head -1',
      parse: (stdout) => {
        const match = stdout.match(/#[0-9a-fA-F]{6,8}/)
        if (!match) return null
        const hex = match[0]
        return hex.length === 9 ? '#' + hex.slice(3) : hex
      },
    },
    {
      cmd: 'settings get secure theme_customization_overlay_packages 2>/dev/null',
      parse: (stdout) => {
        try {
          const json = JSON.parse(stdout.trim())
          const color = json.color_source || json.color_seed || json.android_color_seed
          if (!color) return null
          if (typeof color === 'number') return '#' + (color & 0xFFFFFF).toString(16).padStart(6, '0')
          if (typeof color === 'string' && color.startsWith('#')) return color.slice(0, 7)
          return null
        } catch { return null }
      },
    },
    {
      cmd: 'getprop persist.sys.theme.accent_color 2>/dev/null',
      parse: (stdout) => {
        const trimmed = stdout.trim()
        if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed
        return null
      },
    },
  ]

  for (const strategy of strategies) {
    try {
      const result = await exec(strategy.cmd)
      if (result.errno === 0 && result.stdout) {
        const color = strategy.parse(result.stdout)
        if (color) {
          localStorage.setItem(CACHE_KEY, color)
          return color
        }
      }
    } catch { /* continue to next strategy */ }
  }

  return FALLBACK_SEED
}

/* INFO: Apply Material You theme */
function applyPalette(scheme, isDark) {
  rootCss.style.setProperty('--background', scheme.background)
  rootCss.style.setProperty('--font', scheme.text)
  rootCss.style.setProperty('--desc', scheme.textVariant)
  rootCss.style.setProperty('--bright', scheme.primary)
  rootCss.style.setProperty('--dim', scheme.container)
  rootCss.style.setProperty('--error', scheme.error)
  rootCss.style.setProperty('--icon', scheme.outline)
  rootCss.style.setProperty('--icon-bc', scheme.containerHigh)
  rootCss.style.setProperty('--button', scheme.button)
  rootCss.style.setProperty('--desktop-navbar', scheme.navbar)
  rootCss.style.setProperty('--desktop-navicon', scheme.navicon)

  if (isDark) {
    for (const close_icon of close_icons) {
      close_icon.innerHTML = '<img src="assets/close.svg">'
    }
    for (const expand_icon of expand_icons) {
      expand_icon.innerHTML = '<img class="dimc" src="assets/expand.svg">'
    }
    sp_lang_close.innerHTML = '<img src="./assets/back.svg"/>'
    sp_theme_close.innerHTML = '<img src="./assets/back.svg"/>'
    sp_errorh_close.innerHTML = '<img src="./assets/back.svg"/>'
    setDarkNav()
  } else {
    for (const close_icon of close_icons) {
      close_icon.innerHTML = light_close_icon
    }
    for (const expand_icon of expand_icons) {
      expand_icon.innerHTML = light_expand_icon
    }
    sp_lang_close.innerHTML = light_page_exit_icon
    sp_theme_close.innerHTML = light_page_exit_icon
    sp_errorh_close.innerHTML = light_page_exit_icon
    setLightNav()
  }
}

export async function setMaterialYou(chooseSet) {
  const seedColor = await extractSeedColor()
  const palette = generatePalette(seedColor)
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  applyPalette(isDark ? palette.dark : palette.light, isDark)

  if (chooseSet) setData('material_you')
}

/* INFO: Re-apply on system theme change (called from theme.js) */
export async function refreshMaterialYou() {
  const seedColor = localStorage.getItem(CACHE_KEY) || FALLBACK_SEED
  const palette = generatePalette(seedColor)
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  applyPalette(isDark ? palette.dark : palette.light, isDark)
}

function setData(mode) {
  localStorage.setItem('/system/theme', mode)

  return mode
}
