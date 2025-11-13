import { content } from '../index.js';
import { settings } from './storage.js';

export function setTheme(theme) {
    settings.set('theme', theme);
    applyTheme();
}

export function applyTheme() {
    const theme = settings.get('theme');
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#0f0f14");
    }

    document.body.classList.remove('light');
    if (theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add('light');
            if (metaThemeColor) {
                metaThemeColor.setAttribute("content", "#E9E9EC");
            }
        }
    } else if (theme === 'light') {
        document.body.classList.add('light');
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", "#E9E9EC");
        }
    }

    if (content.dataset.page === 'settings') {
        document.querySelector('#theme .value').innerText = themeName();
    }
}

export function themeName() {
    const theme = settings.get('theme');
    if (theme === 'system') {
        return 'System';
    } else if (theme === 'light') {
        return 'Light';
    } else {
        return 'Dark';
    }
}