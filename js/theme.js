'use strict';
const ICON_SUN='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_MOON='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.7 6.7 0 0 0 9.7 9.7Z"/></svg>';
function applyTheme(){
  const mode=S.settings&&S.settings.theme==='dark'?'dark':'light';
  document.documentElement.setAttribute('data-theme',mode);
  const button=document.getElementById('theme-toggle');
  if(button){
    button.innerHTML=mode==='dark'?ICON_SUN:ICON_MOON;
    button.setAttribute('aria-label',mode==='dark'?'Switch to light mode':'Switch to dark mode');
    button.title=mode==='dark'?'Switch to light mode':'Switch to dark mode';
  }
}
function toggleTheme(){
  const previous=S.settings.theme==='dark'?'dark':'light';
  S.settings.theme=previous==='dark'?'light':'dark';
  if(!save()){S.settings.theme=previous;applyTheme();return}
  applyTheme();
  toast(S.settings.theme==='dark'?'Dark mode enabled':'Light mode enabled');
}
applyTheme();
