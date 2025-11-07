import { icon } from "../scripts/icons.js";
import { title, content, backButton } from "../index.js";
import { activeTab, toTop } from "../scripts/utils.js"
import { storage } from "../scripts/storage.js";
import { getFeed } from "../scripts/api.js";

export function feedPage() {
    title.innerText = 'Feed';
    content.dataset.page = 'feed';
    toTop();
    activeTab('nav-feed');

    if (storage.get('session')) {
        content.innerHTML = `
            <div class="post newpost" id="newPost" onclick="newPost()">
                <div class="pfp-container">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');" onclick=""></div>
                </div>
                <div class="post-container">
                <div class="post-content" onclick=""  style="margin: auto 0;height:9px;opacity:0.8;font-weight: 500;"><p>What's on your mind?</p></div>
                </div>
            </div>
            <div class="content-center post-border-top" id="loading">
                <span class="loader animate">${icon.loader}</span>
            </div>
        `;

        getFeed();
    } else {
        content.innerHTML = `<span class="no-feed">Login to see your feed!</span>`
    }
    
    backButton.classList.remove('active');
}