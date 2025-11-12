import { router } from "./scripts/router";
import { feedPage } from './pages/feed.js';
import { explorePage } from './pages/explore.js';
import { searchPage } from './pages/search.js';
import { userPage, myProfile } from './pages/user.js';
import { postPage } from './pages/post.js';
import { notificationsPage } from './pages/notifications.js';
import { settingsPage } from './pages/settings.js';
import { applyTheme } from './scripts/theme.js';
import { openModal, closeModal, closeAlert } from "./scripts/modals.js";

import { storage, settings } from './scripts/storage.js';
import { icon } from './scripts/icons.js';

import { notificationBadge, checkWom, lovePost, markAsRead, loadMoreUserPosts } from './scripts/api.js';
import { newPost, newComment, newRepost, pfpModal, bannerModal, logoutModal, saveBio } from './scripts/page-helpers.js';
import { toTop, jump } from "./scripts/utils.js";

export const URL = 'http://localhost:8000';
export const dropdowns = new Map();
export const version = '1.0.1';

export const app = document.querySelector('.app');
export const nav = document.querySelector('.nav');
export const content = document.querySelector('.content');
export const title = document.querySelector('.title');
export const backButton = document.querySelector('#back');
export const splash = document.querySelector('.splash');

export let notifications = 0;
export function setNotifications(v) {
    notifications = v;
}

export const postImages = (() => {
    let postImages = [];

    return {
        get(i) {
            return postImages[i];
        },
        push(img) {
            postImages.push(img);
        },
        remove(no) {
            postImages.splice(no, 1);
        },
        clear() {
            postImages = [];
        },
        length() {
            return postImages.length;
        },
        return() {
            return postImages;
        }
    }
})();

router.add('/', feedPage, 'feed');
router.add('/explore', explorePage, 'explore');
router.add('/search', searchPage, 'explore');
router.add('/users/:username', userPage, 'users');
router.add('/posts/:id', postPage, 'post');
router.add('/notifications', notificationsPage, 'notifications');
router.add('/settings', settingsPage, 'settings');

nav.innerHTML = `
    <div class="nav-logo">
        <span class="logo">${icon.wom}</span>
    </div>
    <div class="nav-items">
        <div class="nav-item active" id="nav-feed">
            ${icon.home}
        </div>
        <div class="nav-item" id="nav-explore">
            ${icon.search}
        </div>
        <div class="nav-item">
            ${icon.add}
        </div>
        <div class="nav-item" id="nav-notifications">
            ${icon.notifications}
            <span class="notification-badge">0</span>
        </div>
        <div class="nav-item" id="nav-profile">
            ${icon.profile}
        </div>
    </div>
    <div class="nav-profile" id="nav-settings">
        ${storage.get('session') ? `<span class="status-pfp online" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></span>` : icon.settings}
    </div>
`;

document.getElementById('nav-feed')?.addEventListener('click', () => router.navigate('/'));
document.getElementById('nav-explore')?.addEventListener('click', () => router.navigate('/explore'));
document.querySelector('.nav-item:nth-child(3)')?.addEventListener('click', () => newPost());
document.getElementById('nav-notifications')?.addEventListener('click', () => router.navigate('/notifications'));
document.getElementById('nav-profile')?.addEventListener('click', () => myProfile());
document.querySelector('.nav-profile')?.addEventListener('click', () => router.navigate('/settings'));

splash.innerHTML = `<div class="splash-logo">${icon.wom}</div>`

backButton.innerHTML = icon.back;
backButton.addEventListener('click', () => {
    history.back();
});

content.innerHTML = `
<div class="content-center">
<span class="loader animate">${icon.loader}</span>
</div>
`

document.querySelector('.jump').innerHTML = icon.up;
document.querySelector('.jump').addEventListener('click', () => {
    jump();
});

app.addEventListener('scroll', () => {
    if (app.scrollTop > 100) {
        document.querySelector('.jump').classList.add('active');
    } else {
        document.querySelector('.jump').classList.remove('active');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    router.navigate(window.location.pathname, false);

    if (!settings.get('theme')) {
        settings.set('theme', 'system');
    }
    applyTheme();

    notificationBadge();

    setTimeout(() => {
        checkWom();
    }, 1000);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeAlert();
    }

    if (!document.activeElement || document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        if (e.shiftKey) {
            if (e.key === 'N') {
                e.preventDefault();
                if (document.getElementById('create-post')) return;
                newPost();
            }
        }

        if (e.key === 'Escape' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (notifications > 0) {
                setNotifications(0);
                notificationBadge();
                markAsRead();
            }
        }

        if (e.key === ',' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            router.navigate('/settings');
        }

        if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            openModal({ title: 'Keyboard shortcuts', body: `
                <div class="shr-cards">
                    <div class="shr-card">
                        <h3>Keyboard shortcuts</h3>
                        <div class="row">
                            <span class="key">⌘</span>
                            <span class="key">/</span>
                        </div>
                    </div>
                    <div class="shr-card">
                        <h3>Settings</h3>
                        <div class="row">
                            <span class="key">⌘</span>
                            <span class="key">,</span>
                        </div>
                    </div>
                    <div class="shr-card">
                        <h3>New Post</h3>
                        <div class="row">
                            <span class="key">shift</span>
                            <span class="key">N</span>
                        </div>
                    </div>
                    <div class="shr-card">
                        <h3>Command palette</h3>
                        <div class="row">
                            <span class="key">⌘</span>
                            <span class="key">K</span>
                        </div>
                    </div>
                    <div class="shr-card">
                        <h3>Mark all as read</h3>
                        <div class="row">
                            <span class="key">⌘</span>
                            <span class="key">esc</span>
                        </div>
                    </div>
                </div>
            `});
        }

        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            toggleCmdPalette(true);
        }
    }
});

document.addEventListener('click', (e) => {
    const post = e.target.closest('.post.unfocused');
    if (!post || e.target.closest('.post-info-item, .context, .dropdown, .button')) return;
    router.navigate(`/posts/${post.id}`);
});

document.addEventListener('click', (e) => {
    const button = e.target.closest('.button[data-action]');
    if (!button) return;

    e.stopPropagation();

    const action = button.dataset.action;
    const id = button.dataset.id;

    switch (action) {
        case 'love':
        lovePost(id);
        break;

        case 'repost':
        newRepost(id);
        break;

        case 'comment':
        newComment(id, null);
        break;

        case 'profile':
        router.navigate(`/users/${id}`);
        break;

        case 'change-pfp':
        pfpModal();
        break;

        case 'change-banner':
        bannerModal();
        break;

        case 'save-bio':
        saveBio();
        break;

        case 'logout':
        logoutModal();
        break;

        case 'load-more-user-posts':
        loadMoreUserPosts(id);
        break;

        default:
        console.warn('Unknown post action:', action);
    }
});

let handleKeydownCmd;
let handleClickOutsideCmd;
let handleEnterCmd;

function toggleCmdPalette(open) {
    const cmd = document.querySelector('.command-palette-outer');
    const input = document.querySelector('.command-palette-input');

    if (open) {
        if (cmd.classList.contains('open')) return;
        cmd.classList.add('open');

        handleKeydownCmd = (e) => {
            if (e.key === 'Escape') {
                toggleCmdPalette(false);
            }
        };

        handleClickOutsideCmd = (e) => {
            if (!document.querySelector('.command-palette').contains(e.target)) {
                toggleCmdPalette(false);
            }
        };

        handleEnterCmd = (e) => {
            if (e.key === 'Enter') {
                if (!input.value.trim()) return;
                const query = input.value.trim();

                if (query[0] === '@') {
                    const user = query.slice(1);
                    if (user) {
                        router.navigate(`/users/${user}`);
                    }
                } else {
                    router.navigate(`/search?q=${event.target.value.trim()}`);
                }

                toggleCmdPalette(false);
            }
        };

        document.addEventListener('keydown', handleKeydownCmd);
        document.addEventListener('click', handleClickOutsideCmd);
        input.addEventListener('keydown', handleEnterCmd);

        input.focus();
        if (input.value !== '') {
            input.select();
        }
    } else {
        cmd.classList.remove('open');

        document.removeEventListener('keydown', handleKeydownCmd);
        document.removeEventListener('click', handleClickOutsideCmd);
        document.querySelector('.command-palette-input')
            ?.removeEventListener('keydown', handleEnterCmd);
    }
}

export function notificationsIcon() {
    let favicon = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");

    if (notifications > 9) {
        favicon.href = `/images/active/icon-active-more.png`;
    } else {
        favicon.href = `/images/active/icon-active-${notifications}.png`;
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    applyTheme();
});
