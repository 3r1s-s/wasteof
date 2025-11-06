const URL = 'http://localhost:8000';
const dropdowns = new Map();

const storage = (() => {
    let storageData = {};
    let storageName = 'wasteof-data';

    try {
        storageData = JSON.parse(localStorage.getItem(storageName) || '{}');
    } catch (e) {
        console.error(e);
    }

    return {
        get(key) {
            return storageData[key];
        },

        set(key, value) {
            storageData[key] = value;
            localStorage.setItem(storageName, JSON.stringify(storageData));
        },

        delete(key) {
            delete storageData[key];
            localStorage.setItem(storageName, JSON.stringify(storageData));
        },

        all() {
            return storageData;
        },

        clear() {
            storageData = {};
            localStorage.setItem(storageName, JSON.stringify(storageData));
        },

        settings: {
            get(key) {
                return storageData && storageData.settings && storageData.settings[key];
            },

            set(key, value) {
                if (!storageData.settings) {
                    storageData.settings = {};
                }
                storageData.settings[key] = value;
                localStorage.setItem(storageName, JSON.stringify(storageData));
            },

            delete(key) {
                if (storageData.settings) {
                    delete storageData.settings[key];
                    localStorage.setItem(storageName, JSON.stringify(storageData));
                }
            },

            all() {
                return storageData.settings || {};
            },

            clear() {
                if (storageData.settings) {
                    storageData.settings = {};
                    localStorage.setItem(storageName, JSON.stringify(storageData));
                }
            }
        },
    };
})();

const settings = storage.settings;

const app = document.querySelector('.app');
const nav = document.querySelector('.nav');
const content = document.querySelector('.content');
const title = document.querySelector('.title');
const backButton = document.querySelector('#back');
const splash = document.querySelector('.splash');

let notifications = 0;

String.prototype.sanitize = function () {
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/`/g, '&#96;').replace(/'/g, '&#39;');
};

String.prototype.code = function () {
    return `<div class="json-block">${this.sanitize()}</div>`;
};

const device = {
    is: {
        iPhone: /iPhone/.test(navigator.userAgent),
        iPad: /iPad/.test(navigator.userAgent),
        iOS: /iPhone|iPad|iPod/.test(navigator.userAgent),
        android: /Android/.test(navigator.userAgent),
        mobile: /Mobi|Android/i.test(navigator.userAgent) // matches most mobile browsers
    },
    prefers: {
        language: navigator.language || navigator.userLanguage,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        reducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches
    },
    supports: {
        share: typeof navigator.share === 'function',
        directDownload: 'download' in document.createElement('a'),
        haptics: 'vibrate' in navigator || 'Vibrate' in window || typeof window.navigator.vibrate === 'function',
    },
    userAgent: navigator.userAgent
};

const router = (() => {
    const routes = [];

    function add(path, renderFn) {
        const paramNames = [];
        const regexPath = path
            .replace(/:([^/]+)/g, (_, key) => {
                paramNames.push(key);
                return '([^/]+)';
            })
            .replace(/\//g, '\\/');

        const regex = new RegExp(`^${regexPath}$`);
        routes.push({ regex, paramNames, renderFn });
    }

    function match(path) {
        for (const { regex, paramNames, renderFn } of routes) {
            const match = path.match(regex);
            if (match) {
                const params = {};
                paramNames.forEach((name, i) => {
                    params[name] = decodeURIComponent(match[i + 1]);
                });
                return { renderFn, params };
            }
        }
        return null;
    }

    function navigate(path, push = true) {
        const [pathname, queryString] = path.split('?');

        const result = match(pathname);
        if (result) {
            if (push) history.pushState({}, '', path);
            result.renderFn(result.params);
        } else {
            console.warn(`No route found for ${pathname}`);
        }
    }

    function back() {
        history.back();
    }

    function location() {
        return window.location.pathname;
    }

    window.addEventListener('popstate', () => {
        const path = window.location.pathname;
        navigate(path, false);
    });

    return { add, navigate, back, location };
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
        <div class="nav-item active" onclick="router.navigate('/')" id="nav-feed">
            ${icon.home}
        </div>
        <div class="nav-item" onclick="router.navigate('/explore')" id="nav-explore">
            ${icon.search}
        </div>
        <div class="nav-item" onclick="newPost()"">
            ${icon.add}
        </div>
        <div class="nav-item" onclick="router.navigate('/notifications')" id="nav-notifications">
            ${icon.notifications}
            <span class="notification-badge">0</span>
        </div>
        <div class="nav-item" onclick="myProfile()" id="nav-profile">
            ${icon.profile}
        </div>
    </div>
    <div class="nav-profile" onclick="router.navigate('/settings')">
        ${storage.get('session') ? `<span class="status-pfp online" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></span>` : icon.settings}
    </div>
`;

splash.innerHTML = `<div class="splash-logo">${icon.wom}</div>`

backButton.innerHTML = icon.back;

content.innerHTML = `
<div class="content-center">
<span class="loader animate">${icon.loader}</span>
</div>
`

document.querySelector('.jump').innerHTML = icon.up;

function loginModal() {
    openModal({
        body: `
        <div class="login-modal">
            <img src="/images/icon-web.png" style="width: 100px; height: 100px; user-select: none;">
            <span class="wordmark">wasteof</span>
            <span class="login-title">Log in to your account</span>
            <div class="login-inputs blue">
                <div class="form larger"><input class="form-input" id="user" type="text" autocomplete=""><label for="user">Username</label></div>
                <div class="form larger"><input class="form-input" id="pass" type="password" autocomplete=""><label for="pass">Password</label></div>
            </div>
            <span class="signup">Or <a href="https://wasteof.money/join">Sign up</a></span>
        </div>
        `,
        fill: false,
        buttons: [
            { text: "Cancel", action: `closeModal();` },
            { text: "Login", action: `login(document.getElementById('user').value, document.getElementById('pass').value);loggingIn();`, highlight: `true` }
        ],
        center: true,
        small: true
    })
}

function timeAgo(tstamp) {
    const currentTime = Date.now();
    const lastSeenTime = tstamp;
    const timeDifference = currentTime - lastSeenTime;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
        return `${years}y`;
    } else if (months > 0) {
        return `${months}mo`;
    } else if (days > 0) {
        return `${days}d`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${seconds}s`;
    }
}

function joinedAgo(tstamp) {
    const currentTime = Date.now();
    const lastSeenTime = tstamp;
    const timeDifference = currentTime - lastSeenTime;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
}

function jump() {
    let scroll
    scroll = "smooth";

    app.scrollTo({
        top: 0,
        behavior: scroll
    });
}

function toTop() {
    app.scrollTo({
        top: 0,
    });
}

app.addEventListener('scroll', () => {
    if (app.scrollTop > 100) {
        document.querySelector('.jump').classList.add('active');
    } else {
        document.querySelector('.jump').classList.remove('active');
    }
});

function activeTab(id) {
    const tabs = document.querySelectorAll('.nav-item');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    if (id) {
        document.getElementById(id).classList.add('active');
    }
}

function openDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    dropdown.classList.add('open');

    const handleClickOutside = (e) => {
        if (!dropdown.contains(e.target)) {
            closeDropdown(dropdownId);
        }
    };

    const existing = dropdowns.get(dropdownId);
    if (existing) document.removeEventListener('click', existing);

    document.addEventListener('click', handleClickOutside);
    dropdowns.set(dropdownId, handleClickOutside);
}


function closeDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);

    const handler = dropdowns.get(dropdownId);
    if (handler) {
        document.removeEventListener('click', handler);
        dropdowns.delete(dropdownId);
    }

    if (dropdown) {
        dropdown.classList.remove('open');
    }
}

function setTheme(theme) {
    settings.set('theme', theme);
    applyTheme();
}

function applyTheme() {
    const theme = settings.get('theme');

    document.body.classList.remove('light');
    if (theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add('light');
        }
    } else if (theme === 'light') {
        document.body.classList.add('light');
    }

    if (content.dataset.page === 'settings') {
        document.querySelector('.value').innerText = themeName();
    }
}

function themeName() {
    const theme = settings.get('theme');
    if (theme === 'system') {
        return 'System';
    } else if (theme === 'light') {
        return 'Light';
    } else {
        return 'Dark';
    }
}

function uploadImage() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = () => {
            const file = input.files[0];
            if (!file) return reject('No file selected');

            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        };

        input.click();
    });
}

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
            // if notifs amount > 0
            // add badge to favicon too
            // markAsRead();
        }

        if (e.key === ',' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            router.navigate('/settings');
        }

        if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            openModal({ title: 'Keyboard shortcuts', body: `hi` });
        }

        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            toggleCmdPalette(true);
        }
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

function setNotificationsIcon() {
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
