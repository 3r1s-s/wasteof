import { iconC } from "../scripts/icons.js";
import { title, content, actionButton } from "../index.js";
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

    actionButton.show();
    actionButton.text('Mark as Read');
    actionButton.action('mark-as-read');

    content.innerHTML = `
        <div class="floating" id="loading">
            <eui-loader></eui-loader>
        </div>
        <div class="unread"></div>
        <hr>
        <div class="read"></div>
    `;

    loadNotifications();
}
