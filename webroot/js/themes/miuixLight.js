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

export function setMiuixLight(chooseSet) {
  rootCss.style.setProperty('--background', '#F7F7F7')
  rootCss.style.setProperty('--font', '#000000')
  rootCss.style.setProperty('--desc', '#8C93B0')
  rootCss.style.setProperty('--bright', '#3482FF')
  rootCss.style.setProperty('--dim', '#FFFFFF')
  rootCss.style.setProperty('--error', '#E94634')
  rootCss.style.setProperty('--icon', '#D9D9D9')
  rootCss.style.setProperty('--icon-bc', '#E8E8E8')
  rootCss.style.setProperty('--button', '#FFFFFF')
  rootCss.style.setProperty('--desktop-navbar', '#FFFFFF')
  rootCss.style.setProperty('--desktop-navicon', '#F0F0F0')

  if (chooseSet) setData('miuix_light')

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

function setData(mode) {
  localStorage.setItem('/system/theme', mode)

  return mode
}
