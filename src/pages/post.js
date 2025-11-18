import { icon } from "../scripts/icons.js";
import { title, content, backButton, actionButton } from "../index.js";
import { activeTab, toTop, updateContext, dropdownListeners, repostListener, setTranslucentTitle } from "../scripts/utils.js"
import { storage } from "../scripts/storage.js";
import { manageCache, fetchPostPage, createPost, loadPostComments } from "../scripts/api.js";
import { newComment } from "../scripts/page-helpers.js";

export function postPage(params) {
    setTranslucentTitle(false);
    title.innerText = `Post`;
    content.dataset.page = 'post';
    toTop();

    actionButton.hide();

    let newReplyDiv = `
        <div class="post newpost" id="newReply" data-id="${params.id}">
            <div class="pfp-container">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></div>
            </div>
            <div class="post-container">
                <div class="post-header"><div class="post-title">${storage.get('user')}</div></div>
                <div class="post-content"><p style="opacity: 0.8;">Write a comment...</p></div>
            </div>
        </div>
    `;

    content.innerHTML = `
        <div class="post-view">
            <div class="content-center post-border-bottom" id="loading-post"><span class="loader animate">${icon.loader}</span></div>
        </div>
        <div class="post-replies">
            ${storage.get('session') ? newReplyDiv : ''}
            <div class="content-center post-border-top" id="loading"><span class="loader animate">${icon.loader}</span></div>
        </div>
    `;

    const newReply = content.querySelector('#newReply');
    if (newReply) {
        newReply.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = newReply.dataset.id;
            newComment(id, null);
        });
    }

    if (manageCache.get(params.id) === null) {
        fetchPostPage(params.id);
        return;
    }

    let post = manageCache.get(params.id).data;
    const postView = document.querySelector('.post-view');
    if (postView) {
        postView.innerHTML = createPost(post, false, true);
    }

    loadPostComments(params.id);
    updateContext(params.id);
    repostListener(params.id);
    dropdownListeners();
    
    backButton.classList.add('active');
}