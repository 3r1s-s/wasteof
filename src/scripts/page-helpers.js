import {
    loadUserSettings, sendPost, fetchPost,
    deletePost, loadCommentPreview, sendComment, loadRepostPreview, setBio,
    logout, login
} from "./api.js";
import { storage } from "./storage.js";
import { openModal, closeModal, openAlert, closeAlert } from "./modals.js";
import { iconC } from "./icons.js";
import { app, postImages } from "../index.js";
import { dropdownListeners, uploadImage } from "./utils.js"
import { initializeCropper, saveCroppedPfp, saveBanner } from "./image.js";


export function loginModal() {
    openModal({
        body: `
        <div class="login-modal">
            <img src="/images/coolwave.png" class="login-banner">
            <img src="/images/icon-blue.png" style="width: 100px; height: 100px; user-select: none;" class="app-icon">
            <span class="wordmark">wasteof</span>
            <span class="login-title">Log in to your account</span>
            <div class="login-inputs blue">
                <div class="form larger"><input class="form-input" id="user" type="text" autocomplete="username" placeholder=""><label for="user">Username</label></div>
                <div class="form larger"><input class="form-input" id="pass" type="password" autocomplete="none" placeholder=""><label for="pass">Password</label></div>
            </div>
            <span class="signup">Or <a href="https://wasteof.money/join">Sign up</a></span>
            <small style="width: 100%;">This is an unofficial client btw.</small>
        </div>
        `,
        fill: false,
        buttons: [
            { text: "Cancel", action: closeModal },
            { text: "Login", action: () => { login(document.getElementById('user').value, document.getElementById('pass').value); closeModal() }, highlight: `true` }
        ],
        center: true,
        small: true, my: 445,
        login: true
    })
}

export function logoutModal() {
    openAlert({ title: 'Log out?', message: 'Are you sure you want to log out?', center: true, buttons: [{ text: 'OK', action: () => { logout() } }, { text: 'Cancel', action: () => closeAlert() }] })
}

export async function myInfo() {
    const res = await loadUserSettings(storage.get('user'));
    const color = res.color
    document.querySelector('[data-dropdown="color"]').innerHTML = `
    <span class="value">
        <span>${color.charAt(0).toUpperCase() + color.slice(1)}</span><span id="${color}" class="color-pre"></span>
    </span>
    `;

    document.getElementById('about-me').value = res.bio;
    document.getElementById('about-me').disabled = false;
}

export async function saveBio() {
    document.getElementById('about-me').disabled = true;
    document.getElementById('save-bio').disabled = true;

    const bio = document.getElementById('about-me').value;
    await setBio(bio);
    myInfo();

    document.getElementById('save-bio').disabled = false;
}

export function newPost() {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    postImages.clear();
    openModal({
        post: true,
        buttons: [{ text: 'Post', action: sendModalPost }],
        body: `
            <div class="modal-close">${iconC.cross}</div>
            <div class="create-post" id="create-post">
                <div class="pfp-container">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></div>
                </div>
                <div class="create-post-container">
                    <div class="post-header">
                        <div class="post-title">${storage.get('user')}</div>
                    </div>
                    <div class="post-content">
                        <textarea placeholder="What's on your mind?" id="post-content" class="post-input" style="height: 24px;"></textarea>
                        <div class="post-options">
                            <span class="post-option" id="append-image">${iconC.attachment}</span>
                        </div>    
                        <div class="newpost-attachments"></div>
                    </div>
                </div>
            </div>
        `
    });

    if (window.innerWidth < 1000) {
        setTimeout(() => {
            document.querySelector('.post-input').focus();
        }, 500);
    } else {
        document.querySelector('.post-input').focus();
    }

    const input = document.querySelector('.post-input');
    const close = document.querySelector('.modal-close');

    input.addEventListener('input', () => {
        input.style.height = `24px`;
        input.style.height = `${input.scrollHeight}px`;
    });

    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            sendModalPost();
        }
    });

    close.addEventListener('click', () => {
        closeModal();
    });

    document.getElementById('append-image').addEventListener('click', () => {
        appendImageAlert();
    });
}

export function appendImageAlert() {
    openAlert({
        title: 'Attach an image',
        message: 'Paste the URL of the image you want to attach',
        input: true,
        buttons: [{ text: 'Attach', action: appendImage }, { text: 'Cancel', action: closeAlert }]
    });
}

export function appendImage() {
    const response = document.getElementById('alert-input').value;
    closeAlert();
    if (response) {
        postImages.push(response);
        const attachments = document.querySelector('.newpost-attachments');
        attachments.innerHTML += `
            <div class="newpost-attachment" style="--image: url('${response}');" data-no="${postImages.get(response)}">
                <div class="newpost-remove-attachment" id="remove-image">${iconC.cross}</div>
            </div>
        `;
    }

    document.getElementById('alert-input').value = '';

    const remove = document.querySelectorAll('.newpost-remove-attachment');
    remove.forEach(button => {
        button.addEventListener('click', () => {
            removeImage(button.parentElement.getAttribute('data-no'));
        });
    });
}

function removeImage(no) {
    event.stopPropagation();
    postImages.remove(no);
    document.querySelector(`.newpost-attachment[data-no="${no}"]`).remove();
}

export function newRepost(id) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    openModal({
        post: true,
        buttons: [{ text: 'Post', action: () => { sendModalRepost(id) } }],
        body: `
            <div class="modal-close">${iconC.cross}</div>
            <div class="create-post">
                <div class="pfp-container">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></div>
                </div>
                <div class="create-post-container">
                    <div class="post-header">
                        <div class="post-title">${storage.get('user')}</div>
                    </div>
                    <div class="post-content">
                        <textarea placeholder="What do you think about this post?" id="post-content" class="post-input" style="height: 24px;"></textarea>
                    </div>
                    <div class="post-options">
                        <span class="post-option" id="append-image">${iconC.attachment}</span>
                    </div>    
                    <div class="newpost-attachments"></div>
                    <div class="post-repost" id="post-repost"></div>
                </div>
            </div>
        `
    });

    loadRepostPreview(id);

    document.querySelector('.post-input').focus();

    const input = document.querySelector('.post-input');

    input.addEventListener('input', () => {
        input.style.height = `24px`;
        input.style.height = `${input.scrollHeight}px`;
    });

    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            sendModalRepost(id);
        }
    });

    document.getElementById('append-image').addEventListener('click', () => {
        appendImageAlert();
    });
}

export function newComment(id, parent, postid) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    openModal({
        post: true,
        buttons: [{ text: 'Post', action: () => sendModalComment(id, parent, postid) }],
        body: `
            <div class="modal-close">${iconC.cross}</div>
            <div class="replying-to">
                <div class="content-center" id="preview-loading" style="padding:0.25rem;">
                <eui-loader></eui-loader>
                </div>
            </div>
            <div class="create-post">
                <div class="pfp-container">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></div>
                </div>
                <div class="create-post-container">
                    <div class="post-header">
                        <div class="post-title">${storage.get('user')}</div>
                    </div>
                    <div class="post-content">
                        <textarea placeholder="Reply to " id="post-content" class="post-input reply-input"></textarea>
                    </div>
                </div>
            </div>
        `
    });

    loadCommentPreview(id, parent, postid);

    document.querySelector('.post-input').focus();

    const input = document.querySelector('.post-input');

    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
    });

    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            sendModalComment(id, parent, postid);
        }
    });
}

function sendModalPost() {
    if (document.querySelector('.post-input').value.trim() !== '') {
        sendPost(document.querySelector('.post-input').value.trim());
    } else if (postImages.length() > 0) {
        sendPost('');
    }
    closeModal();
}

function sendModalRepost(id) {
    sendPost(document.querySelector('.post-input').value.trim(), id);
    closeModal();
}

function sendModalComment(commentid, parent, postid) {
    if (document.querySelector('.post-input').value.trim() !== '') {
        if (postid) {
            sendComment(postid, document.querySelector('.post-input').value.trim(), commentid);
        } else {
            sendComment(commentid, document.querySelector('.post-input').value.trim(), null);
        }
    }
}

export function deletePostModal(id) {
    openAlert({ title: 'Delete?', message: 'Are you sure you want to delete this post?', buttons: [{ text: 'OK', action: () => { deletePost(id); closeAlert(); } }, { text: 'Cancel', action: closeAlert }], center: true })
}

export function pfpModal() {
    openModal({
        small: true,
        mx: 400,
        my: 300,
        buttons: [],
        body: `
            <div class="modal-close">${iconC.cross}</div>
            <h3 class="modal-center-title">Upload Image</h3>
            <div class="upload-image" style="margin: auto;">
                ${iconC.attachment}
                <span>Upload Image</span>
            </div>
        `
    });

    document.querySelector('.upload-image').addEventListener('click', () => {
        editPfpModal();
    });
}

export function bannerModal() {
    openModal({
        small: true,
        mx: 400,
        my: 300,
        buttons: [],
        body: `
            <div class="modal-close">${iconC.cross}</div>
            <h3 class="modal-center-title">Upload Image</h3>
            <div class="upload-image" style="margin: auto;">
                ${iconC.attachment}
                <span>Upload Image</span>
            </div>
        `
    });

    document.querySelector('.upload-image').addEventListener('click', () => {
        editBannerModal();
    });
}

async function editPfpModal() {
    try {
        const imageData = await uploadImage();
        closeModal();
        setTimeout(() => {
            openModal({
                small: true,
                mx: 400,
                my: 500,
                buttons: [
                    { text: 'Cancel', action: closeModal },
                    { text: 'Save', action: saveCroppedPfp, highlight: true }
                ],
                body: `
                    <div class="modal-close">${iconC.cross}</div>
                    <h3 class="modal-center-title">Adjust Profile Picture</h3>
                    <div class="image-cropper">
                        <div class="crop-container">
                            <div class="crop-image-wrapper" id="crop-area">
                                <img src="${imageData}" id="crop-image" draggable="false">
                            </div>
                            <div class="crop-overlay">
                                <div class="crop-circle"></div>
                            </div>
                        </div>
                        <div class="crop-controls">
                            <input type="range" min="100" max="300" value="100" id="zoom-slider">
                        </div>
                    </div>
                `
            });

            initializeCropper(imageData);
        }, 1000);

    } catch (err) {
        console.error('Upload canceled or failed:', err);
    }
}

async function editBannerModal() {
    try {
        const imageData = await uploadImage();
        closeModal();
        setTimeout(() => {
            openModal({
                small: true,
                mx: 400,
                my: 300,
                buttons: [
                    { text: 'Cancel', action: 'closeModal()' },
                    { text: 'Save', action: () => saveBanner(), highlight: true }
                ],
                body: `
                    <div class="modal-close">${iconC.cross}</div>
                    <h3 class="modal-center-title">Preview Banner</h3>
                    <div class="banner-section">
                        <img src="${imageData}" id="crop-image banner" class="banner-crop" draggable="false">
                    </div>
                `
            });
        }, 1000);

    } catch (err) {
        console.error('Upload canceled or failed:', err);
    }
}

export function reportModal(id) {
    openModal({
        mx: 400,
        buttons: [
            { text: 'Cancel', action: 'closeModal()' },
            { text: 'Report', action: `sendReportModal('${id}')`, highlight: true }
        ],
        body: `
            <div class="modal-close">${iconC.cross}</div>
            <h3 class="modal-center-title">Report Post</h3>
            <div class="post-report" id="post-repost"></div>

            </div>
            `
    });

    loadRepostPreview(id);
}

function setReportReason(reason) {
    document.getElementById('report-reason').innerText = reason;
    closeDropdown('report-options')
}

function sendReportModal(id) {
    reportPost(id, document.getElementById('report-reason').innerText);
    closeModal();
}