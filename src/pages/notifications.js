import { icon } from "../scripts/icons.js";
import { title, content } from "../index.js";
import { activeTab, setTranslucentTitle, toTop } from "../scripts/utils.js"
import { loadNotifications } from "../scripts/api.js";
import { storage } from "../scripts/storage.js";
import { loginModal } from "../scripts/page-helpers.js";

export function notificationsPage() {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    setTranslucentTitle(false);
    title.innerText = 'Notifications';
    content.dataset.page = 'notifications';
    toTop();
    activeTab('nav-notifications');

    content.innerHTML = `
        <div class="floating" id="loading">
            <span class="loader animate">${icon.loader}</span>
        </div>
        <div class="unread"></div>
        <hr>
        <div class="read"></div>
    `;

    loadNotifications();
}
