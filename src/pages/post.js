import { icon } from "../scripts/icons.js";
import { title, content, backButton } from "../index.js";
import { activeTab, toTop, updateContext, dropdownListeners, repostListener } from "../scripts/utils.js"
import { storage } from "../scripts/storage.js";
import { manageCache, fetchPostPage, createPost, loadPostComments } from "../scripts/api.js";

export function postPage(params) {
    title.innerText = `Post`;
    content.dataset.page = 'post';
    toTop();

    content.innerHTML = `
        <div class="post-view">
            <div class="content-center post-border-bottom" id="loading-post"><span class="loader animate">${icon.loader}</span></div>
        </div>
        <div class="post-replies">
            <div class="post newpost" id="newReply" onclick="newComment('${params.id}', null)">
                <div class="pfp-container">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');" onclick=""></div>
                </div>
                <div class="post-container">
                <div class="post-header"><div class="post-title">${storage.get('user')}</div></div>
                <div class="post-content" onclick=""><p style="opacity: 0.8;">Write a comment...</p></div>
                </div>
            </div>
            <div class="content-center post-border-top" id="loading"><span class="loader animate">${icon.loader}</span></div>
        </div>
    `;

    if (manageCache.get(params.id) === null) {
        fetchPostPage(params.id);
        return;
    }

    let post = manageCache.get(params.id).data;
    if (document.querySelector('.post-view')) {   
        document.querySelector('.post-view').innerHTML = createPost(post, false, true);
    }

    loadPostComments(params.id);
    updateContext(params.id);
    repostListener(params.id);

    dropdownListeners();
    
    backButton.classList.add('active');
}