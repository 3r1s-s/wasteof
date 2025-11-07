import { icon } from "../scripts/icons.js";
import { title, content, backButton } from "../index.js";
import { activeTab, toTop } from "../scripts/utils.js"
import { loadUserInfo, loadUserPosts, followButton, loadMoreUserPosts } from "../scripts/api.js";
import { storage } from "../scripts/storage.js";
import { router } from "../scripts/router.js";

export function userPage(params) {
    title.innerText = `@${params.username}`;
    content.dataset.page = 'user';
    toTop();

    content.innerHTML = `
    <div class="profile">
        <div class="banner">
            <img src="https://api.wasteof.money/users/${params.username}/banner" class="profile-banner">
        </div>
        <div class="profile-info">
            <div class="profile-section">
                <div style="--image: url('https://api.wasteof.money/users/${params.username}/picture')" class=" profile-picture" id="profile-picture"></div>
                <div class="profile-name">
                    <span class="username">@${params.username}</span>
                </div>
            </div>
            <div class="profile-section right" style="margin-top: calc(10% + 5px);">
                <button class="follow-button" id="follow-button">Follow</button>
            </div>
        </div>
        <div class="profile-info more">
            <span class="bio" id="bio">--</span>
        </div>
        <div class="profile-info bottom">
            <div>
                <span class="stats">Followers: <span id="followers">0</span> - Following: <span id="following">0</span></span>
            </div>
            <div>
                <span class="date" id="user-date">--</span>
            </div>
        </div>
        <div class="profile-pinned"></div>
        <div class="profile-posts">
        <div class="content-center" id="loading"><span class="loader animate">${icon.loader}</span></div>
        </div>
        <div class="load-more hide" id="load-more" data-pageno="1" onclick="loadMoreUserPosts('${params.username}')"><span>Load more</span></div>
    `;
    
    loadUserInfo(params.username);
    loadUserPosts(params.username);

    followButton(params.username);
    
    backButton.classList.add('active');
}

export function myProfile() {
    if (!storage.get('session')) {
        loginModal();
        return;
    }
    
    activeTab('nav-profile');
    
    router.navigate(`/users/${storage.get('user')}`);
}