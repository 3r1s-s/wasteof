import { icons, router } from '@3r1s_s/erisui';
import "@3r1s_s/erisui/style.css";

// import { router } from "./scripts/router";
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
import { iconC } from './scripts/icons.js';

import { notificationBadge, checkWom, lovePost, markAsRead, loadMoreUserPosts } from './scripts/api.js';
import { newPost, newComment, newRepost, pfpModal, bannerModal, logoutModal, saveBio } from './scripts/page-helpers.js';
import { toTop, jump } from "./scripts/utils.js";
import { haptic } from "./scripts/haptics.js";

export const URL = 'http://localhost:8000';
export const dropdowns = new Map();
export const version = '1.0.1';

export const app = document.querySelector('.app');
export const nav = document.querySelector('.nav');
export const content = document.querySelector('.content');
export const title = document.querySelector('.title');
export const splash = document.querySelector('.splash');

export const backButton = document.querySelector('#back');
export const actionButton = (() => {
    function show() {
        document.querySelector('.action-button').classList.add('active');
    }

    function hide() {
        document.querySelector('.action-button').classList.remove('active');
    }

    function text(t) {
        document.querySelector('.action-button').innerText = t;
    }

    function action(a) {
        document.querySelector('.action-button').dataset.action = a;
    }

    return { show, hide, action, text };
})();

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

icons.register('search', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.9722 16.0994C12.7426 16.981 11.2354 17.5 9.60693 17.5C5.4648 17.5 2.10693 14.1421 2.10693 10C2.10693 5.85786 5.4648 2.5 9.60693 2.5C13.7491 2.5 17.1069 5.85786 17.1069 10C17.1069 11.6284 16.588 13.1356 15.7064 14.3653C15.7731 14.41 15.8365 14.4618 15.8955 14.5208L19.7846 18.4099C20.2728 18.8981 20.2728 19.6895 19.7846 20.1777C19.2964 20.6658 18.505 20.6658 18.0168 20.1777L14.1277 16.2886C14.0688 16.2296 14.0169 16.1662 13.9722 16.0994ZM15.1069 10C15.1069 13.0376 12.6445 15.5 9.60693 15.5C6.56937 15.5 4.10693 13.0376 4.10693 10C4.10693 6.96243 6.56937 4.5 9.60693 4.5C12.6445 4.5 15.1069 6.96243 15.1069 10Z" fill="currentColor"/></svg>');
icons.register('notifications', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="notifications"><path d="M14.3 2.88988C14.12 2.81988 13.98 2.64988 13.93 2.45988C13.8149 2.03619 13.5635 1.66217 13.2147 1.39551C12.8659 1.12885 12.4391 0.984375 12 0.984375C11.5609 0.984375 11.1341 1.12885 10.7853 1.39551C10.4365 1.66217 10.1851 2.03619 10.07 2.45988C10.02 2.65988 9.88 2.81988 9.69 2.88988C8.3192 3.36908 7.13137 4.26275 6.29106 5.44707C5.45075 6.63139 4.99956 8.04773 5 9.49988V11.5899C5 11.7099 4.95 11.8299 4.87 11.9199L3.77 13.1399C3.27354 13.6916 2.9992 14.4077 3 15.1499V15.4299C3 16.0999 3.34 16.7199 3.95 16.9899C5.26 17.5899 7.95 18.4999 12 18.4999C16.05 18.4999 18.74 17.5899 20.05 16.9999C20.66 16.7199 21 16.0999 21 15.4299V15.1499C20.9983 14.4111 20.7242 13.699 20.23 13.1499L19.13 11.9199C19.0478 11.8295 19.0016 11.7121 19 11.5899V9.49988C18.9997 8.04652 18.5471 6.62928 17.7049 5.44482C16.8627 4.26036 15.6727 3.36741 14.3 2.88988ZM14.82 19.8399C14.9105 19.8285 15.0007 19.9087 15 19.9999C15 20.7955 14.6839 21.5586 14.1213 22.1212C13.5587 22.6838 12.7956 22.9999 12 22.9999C11.2044 22.9999 10.4413 22.6838 9.87868 22.1212C9.31607 21.5586 9 20.7955 9 19.9999C9 19.8999 9.09 19.8299 9.18 19.8399C11.0539 20.0538 12.9461 20.0538 14.82 19.8399Z" fill="currentColor"/></svg>');
icons.register('edit', '<svg width="20" height="20" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill="currentColor"></path></svg>');

nav.innerHTML = `
    <div class="nav-logo">
        <span class="logo">${iconC.wom}</span>
    </div>
    <div class="nav-items">
        <div class="nav-item active" id="nav-feed">
            ${iconC.home}
        </div>
        <div class="nav-item" id="nav-explore">
            ${iconC.search}
        </div>
        <div class="nav-item">
            ${iconC.add}
        </div>
        <div class="nav-item" id="nav-notifications">
            ${iconC.notifications}
            <span class="notification-badge">0</span>
        </div>
        <div class="nav-item" id="nav-profile">
            ${iconC.profile}
        </div>
    </div>
    <div class="nav-profile" id="nav-settings">
        ${storage.get('session') ? `<span class="status-pfp online" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></span>` : iconC.settings}
    </div>
`;

document.getElementById('nav-feed')?.addEventListener('click', () => router.navigate('/'));
document.getElementById('nav-explore')?.addEventListener('click', () => router.navigate('/explore'));
document.querySelector('.nav-item:nth-child(3)')?.addEventListener('click', () => newPost());
document.getElementById('nav-notifications')?.addEventListener('click', () => router.navigate('/notifications'));
document.getElementById('nav-profile')?.addEventListener('click', () => myProfile());
document.querySelector('.nav-profile')?.addEventListener('click', () => router.navigate('/settings'));

splash.innerHTML = `<div class="splash-logo">${iconC.wom}</div>`

backButton.innerHTML = iconC.back;
backButton.addEventListener('click', () => {
    history.back();
});

content.innerHTML = `
<div class="content-center">
<eui-loader></eui-loader>
</div>
`

document.querySelector('.jump').innerHTML = iconC.up;
document.querySelector('.jump').addEventListener('click', () => {
    jump();
});

app.addEventListener('scroll', () => {
    if (app.scrollTop > 100) {
        document.querySelector('.jump').classList.add('active');

        if (document.querySelector('.title[data-canhide=true]')) {
            document.querySelector('.title').classList.remove('hide');
        }
    } else {
        document.querySelector('.jump').classList.remove('active');

        if (document.querySelector('.title[data-canhide=true]')) {
            document.querySelector('.title').classList.add('hide');
        }
    }
});

document.querySelector('.newpost-float').innerHTML = `<eui-icon name="edit" width="24" height="24"></eui-icon>`;
document.querySelector('.newpost-float').addEventListener('click', () => newPost());

window.addEventListener('DOMContentLoaded', () => {
    router.navigate(window.location.pathname, false);

    if (!settings.get('theme')) {
        settings.set('theme', 'system');
    }
    applyTheme();
    if (settings.get('glass')) {
        document.body.classList.add('liquid-glass');
    }
    if (settings.get('translucent-titlebar')) {
        document.body.classList.add('translucent-titlebar');
    }
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
            openModal({
                title: 'Keyboard shortcuts', body: `
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

        case 'mark-as-read':
            markAsRead();
            break;

        default:
            console.warn('Unknown post action:', action);
    }
});

document.body.addEventListener('change', (e) => {
    const checkbox = e.target;
    if (!checkbox.matches('.switch input[type="checkbox"]')) return;

    const wrapper = checkbox.closest('.switch');
    const isOn = checkbox.checked;

    wrapper.classList.toggle('selected', isOn);
    haptic();

    const s = checkbox.dataset.setting;
    if (!s) return;
    switch (s) {
        case 'glass':
            settings.set(s, isOn);
            if (isOn) {
                document.body.classList.add('liquid-glass');
            } else {
                document.body.classList.remove('liquid-glass');
            }
            break;

        case 'translucent-titlebar':
            settings.set(s, isOn);
            if (isOn) {
                document.body.classList.add('translucent-titlebar');
            } else {
                document.body.classList.remove('translucent-titlebar');
            }
            break;

        default:
            settings.set(s, isOn);
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

const tabBar = document.querySelector("eui-tab-bar");
tabBar.tabItems = [
    { path: "/", icon: "home", label: "Home" },
    { path: "/explore", icon: "search", label: "Explore" },
    { path: "/notifications", icon: "notifications", label: "Notifications" },
    { path: "/users/eris", avatar: { name: "Eris", src: "https://eris.cafe/src/assets/image/me.png" }, label: "Profile" },
];