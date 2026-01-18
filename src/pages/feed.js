import { iconC } from "../scripts/icons.js";
import { title, content, backButton, actionButton } from "../index.js";
import { activeTab, setTranslucentTitle, toTop } from "../scripts/utils.js"
import { storage } from "../scripts/storage.js";
import { getFeed } from "../scripts/api.js";
import { newPost } from "../scripts/page-helpers.js";

export function feedPage() {
    setTranslucentTitle(false);
    title.innerText = 'Feed';
    content.dataset.page = 'feed';
    toTop();
    activeTab('nav-feed');

    actionButton.hide();

    if (storage.get('session')) {
        content.innerHTML = `
            <div class="post newpost" id="newPost">
                <div class="pfp-container">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');" onclick=""></div>
                </div>
                <div class="post-container">
                <div class="post-content" onclick=""  style="margin: auto 0;height:9px;opacity:0.8;font-weight: 500;"><p>What's on your mind?</p></div>
                </div>
            </div>
            <div class="content-center post-border-top" id="loading">
                <eui-loader></eui-loader>
            </div>
        `;

        getFeed();
    } else {
        content.innerHTML = `<span class="no-feed">Login to see your feed!</span>`
    }

    if (storage.get('session')) {
        document.querySelector('#newPost').addEventListener('click', () => {
            newPost();
        });
    }

    backButton.classList.remove('active');
}