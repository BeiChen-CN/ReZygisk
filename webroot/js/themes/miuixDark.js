import { setDarkNav } from './darkNavbar.js'

const rootCss = document.querySelector(':root')

/* INFO: Changes the icons to match the theme */
const close_icons = document.getElementsByClassName('close_icon')
const expand_icons = document.getElementsByClassName('expander')
const sp_lang_close = document.getElementById('sp_lang_close')
const sp_theme_close = document.getElementById('sp_theme_close')
const sp_errorh_close = document.getElementById('sp_errorh_close')

export function setMiuixDark(chooseSet) {
  rootCss.style.setProperty('--background', '#000000')
  rootCss.style.setProperty('--font', '#E6E6E6')
  rootCss.style.setProperty('--desc', '#787E96')
  rootCss.style.setProperty('--bright', '#277AF7')
  rootCss.style.setProperty('--dim', '#242424')
  rootCss.style.setProperty('--error', '#F12522')
  rootCss.style.setProperty('--icon', '#404040')
  rootCss.style.setProperty('--icon-bc', '#2D2D2D')
  rootCss.style.setProperty('--button', '#000000')
  rootCss.style.setProperty('--desktop-navbar', '#1A1A1A')
  rootCss.style.setProperty('--desktop-navicon', '#2D2D2D')

  if (chooseSet) setData('miuix_dark')

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
}

function setData(mode) {
  localStorage.setItem('/system/theme', mode)

  return mode
}
