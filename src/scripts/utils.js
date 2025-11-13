import { app, dropdowns, content, title } from "../index.js";
import { manageCache, postContext, pinPost, unpinPost } from "./api.js";
import { themeName, setTheme } from "./theme.js";
import { reportModal, deletePostModal } from "./page-helpers.js";
import { router } from "./router.js";
import { settings } from "./storage.js";

export function timeAgo(tstamp) {
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

export function joinedAgo(tstamp) {
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

export function jump() {
    let scroll
    scroll = "smooth";

    app.scrollTo({
        top: 0,
        behavior: scroll
    });
}

export function toTop() {
    app.scrollTo({
        top: 0,
    });
}

export function uploadImage() {
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

export function activeTab(id) {
    const tabs = document.querySelectorAll('.nav-item');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    if (id) {
        document.getElementById(id).classList.add('active');
    }
}

export function dropdownListeners() {
    const context = content.querySelectorAll('.context');
    if (context) {
        context.forEach(context => context.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownId = context.dataset.dropdown;
            if (!dropdownId) return;
            if (document.getElementById(dropdownId).classList.contains('open')) {
                closeDropdown(dropdownId);
                return;
            }
            openDropdown(dropdownId);
        }));
    }

    document.querySelectorAll('.dropdown .option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const option = e.target.closest('.dropdown .option');
            if (!option) return;

            const action = option.dataset.action;
            const value = option.dataset.value;
            const id = option.dataset.id;
            const dropdown = option.closest('.dropdown');

            const dropdownOuter = option.closest('.context-outer');
            if (dropdownOuter) closeDropdown(dropdownOuter.id);

            switch (action) {
                case 'set-theme':
                setTheme(value);
                closeDropdown('theme');
                break;

                case 'set-color':
                profileColor(value);
                closeDropdown('color');
                break;

                case 'logout':
                logoutModal();
                break;

                case 'delete-post':
                deletePostModal(id);
                break;

                case 'pin-post':
                pinPost(id);
                break;

                case 'unpin-post':
                unpinPost(id);
                break;

                case 'report-post':
                reportModal(id);
                break;

                case 'set-glass':
                const boolValue = value === 'true';
                settings.set('glass', boolValue);
                if (content.dataset.page === 'settings') {
                    document.querySelector('#glass .value').innerText = boolValue ? 'On' : 'Off';
                    if (boolValue) {
                        document.body.classList.add('liquid-glass');
                    } else {
                        document.body.classList.remove('liquid-glass');
                    }
                }
                break;

                default:
                console.warn('Unknown dropdown action:', action);
            }
        });
    });
}

export function openDropdown(dropdownId) {
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

export function closeDropdown(dropdownId) {
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

export async function updateContext(id) {
    const postData = manageCache.get(id)?.data;
    if (!postData) {
        console.warn(`No cached data found for post ${id}`);
        return;
    }

    await postContext(postData);
}

export function sanitize(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;')
    .replace(/'/g, '&#39;');
}

export function repostListener() {
    document.querySelector('.post-view').querySelectorAll('.post.repost.clickable').forEach(repost => {
        repost.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = repost.dataset.postId;
            if (id) router.navigate(`/posts/${id}`);
        });
    });
}

export function resetTitle() {
    title.classList.remove('hide');
}

export function setTranslucentTitle(e) {
    title.dataset.canhide = e;
    title.style = `transition: none;`;
    title.classList.remove('hide');
    if (e) {
        title.classList.add('hide');
    }
    setTimeout(() => {
        title.style = ``;
    }, 10);
}