// Pages

let postImages = [];

function feedPage() {
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

function explorePage() {
    title.innerText = 'Explore';
    content.dataset.page = 'explore';
    activeTab('nav-explore');
    toTop();

    content.innerHTML = `
        <div class="explore">
            <div class="search">
                <div class="text-input" style="height: 44px;">
                    <input type="text" placeholder="Search" autocomplete="off">${icon.search}
                </div>
            </div>
            <div class="explore-users">
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:90px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:80px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:100px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:90px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:80px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:100px"></div>
                </div>
            </div>
        </div>
        <div class="content-center" id="loading">
            <span class="loader animate">${icon.loader}</span>
        </div>
        <div class="explore-posts"></div>
    `
    
    getTrending();
    backButton.classList.remove('active');

    document.querySelector('.search input').addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            router.navigate(`/search?q=${event.target.value.trim()}`);
        }
    });
}

function searchPage(q) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    title.innerText = 'Search';
    content.dataset.page = 'search';
    activeTab('nav-explore');
    toTop();

    content.innerHTML = `
        <div class="explore">
            <div class="search">
                <div class="text-input" style="height: 44px;">
                    <input type="text" placeholder="Search" autocomplete="off" value="${query}">${icon.search}
                </div>
            </div>
            <div class="explore-users">
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:90px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:80px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:100px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:90px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:80px"></div>
                </div>
                <div class="nameplate small skeleton">
                    <div class="pfp-container">
                        <div class="pfp"></div>
                    </div>
                    <div class="nameplate-name pill" style="width:100px"></div>
                </div>
            </div>
        </div>
        <div class="explore-posts"></div>
    `
    
    getSearch(query);
    backButton.classList.remove('active');

    document.querySelector('.search input').addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            router.navigate(`/search?q=${event.target.value.trim()}`);
        }
    });
}

function userPage(params) {
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
                <button class="follow-button" onclick="follow('${params.username}');toggleFollowButton();" id="follow-button">Follow</button>
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
        <div class="profile-pinned">
        </div>
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

function postPage(params) {
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
    
    backButton.classList.add('active');
}

function notificationsPage() {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    title.innerText = 'Notifications';
    content.dataset.page = 'notifications';
    toTop();
    activeTab('nav-notifications');

    content.innerHTML = `
        <div class="content-center" id="loading">
            <span class="loader animate">${icon.loader}</span>
        </div>
        <div class="unread"></div>
        <hr>
        <div class="read"></div>
    `;

    loadNotifications();
}

function myProfile() {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    activeTab('nav-profile');

    router.navigate(`/users/${storage.get('user')}`);
}

function settingsPage() {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    title.innerText = 'Settings';
    content.dataset.page = 'settings';
    toTop();
    activeTab();

    let colorsDropdown = `
        <div class="option" onclick="closeDropdown('color');profileColor('red')"><span>Red</span><span id="red" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('orange')"><span>Orange</span><span id="orange" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('yellow')"><span>Yellow</span><span id="yellow" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('green')"><span>Green</span><span id="green" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('teal')"><span>Teal</span><span id="teal" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('cyan')"><span>Cyan</span><span id="cyan" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('blue')"><span>Blue</span><span id="blue" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('indigo')"><span>Indigo</span><span id="indigo" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('purple')"><span>Purple</span><span id="purple" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('fuchsia')"><span>Fuchsia</span><span id="fuchsia" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('pink')"><span>Pink</span><span id="pink" class="color-pre"></span></div>
        <div class="option" onclick="closeDropdown('color');profileColor('gray')"><span>Grey</span><span id="gray" class="color-pre"></span></div>
    `

    content.innerHTML = `
    <div style="padding: 1rem 1.5rem" class="settings">
        <h1>Settings</h1>
        <h3>Appearance</h3>
        <div class="section">
            <span class="title" style="padding: 0 0.5rem">Theme</span>
            <div class="options">
                <div class="context-outer" id="theme">
                    <div class="context" onclick="openDropdown('theme')" data-dropdown="theme">
                    <span class="value">${themeName()}</span>
                    <span class="arrow">${icon.arrow}</span>
                    </div>
                    <div class="dropdown">
                        <div class="option" onclick="setTheme('system');closeDropdown('theme')">System</div>
                        <div class="option" onclick="setTheme('light');closeDropdown('theme')">Light</div>
                        <div class="option" onclick="setTheme('dark');closeDropdown('theme')">Dark</div>
                    </div>
                </div>
            </div>
        </div>
        <h3>Profile</h3>
        <div class="section profile">
            <div class="sec-in">
                <span class="sec-in-title">Profile Picture</span>
                <div class="pfp-section" onclick="pfpModal()">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></div>
                    <div class="pfp-edit">
                        <span class="edit"><span class="edit-icon">${icon.edit}</span></span>
                    </div>
                </div>
            </div>
            <div class="sec-in">
                <span class="sec-in-title">Banner</span>
                <div class="banner-section" onclick="bannerModal()">
                    <img class="banner" src="https://api.wasteof.money/users/${storage.get('user')}/banner">
                    <div class="pfp-edit">
                        <span class="edit"><span class="edit-icon">${icon.edit}</span></span> Change Banner</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="section">
            <div class="sec-in">
                <span class="sec-in-title">About Me</span>
                <textarea class="about-me" placeholder="Write a little about you" id="about-me" disabled></textarea>
                <button class="section-button fit" onclick="saveBio()" id="save-bio">Save</button>
            </div>
        </div>
        <div class="section disabled">
            <span class="title" style="padding: 0 0.5rem">Profile Color</span>
            <div class="options">
                <div class="context-outer" id="color">
                    <div class="context" onclick="openDropdown('color')" data-dropdown="color">
                    <span class="value"><span>---</span><span id="gray" class="color-pre"></span></span>
                    </div>
                    <div class="dropdown bottom">
                        ${colorsDropdown}
                    </div>
                </div>
            </div>
        </div>
        <h3>Account</h3>
        <div class="section">
            <span class="title" style="padding: 0 0.5rem">Log Out</span>
            <div class="options"><button class="section-button" onclick="logoutModal();">Log Out</button></div>
        </div>
        <div class="footer">
            <span>Change other account settings at <a href="https://wasteof.money/settings" target="_blank">wasteof.money/settings</a></span>
            <span>Report issues and give feedback on <a href="https://github.com/3r1s-s/wasteof" target="_blank">GitHub</a></span>
        </div>
        <div class="footer">
            <span class="center">
                <a href="https://wasteof.money/privacy" target="_blank">Privacy</a>
                <span class="dot"></span>
                <a href="https://wasteof.money/rules" target="_blank">Terms</a>
            </span>
            </div>
            <span class="center" style="margin-top: 1rem;opacity: 0.5">
                V${version}
            </span>
    </div>
    `;

    myInfo();
}

// Helpers

async function myInfo() {
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

async function saveBio() {
    document.getElementById('about-me').disabled = true;
    document.getElementById('save-bio').disabled = true;

    const bio = document.getElementById('about-me').value;
    await setBio(bio);
    myInfo();

    document.getElementById('save-bio').disabled = false;
    tooltip({icon: icon.check, title: 'Saved!'});
}

async function fetchPostPage(id) {
    let post = await fetchPost(id);

    if (document.querySelector('.post-view')) {   
        document.querySelector('.post-view').innerHTML = createPost(post.data, false, true);
    }

    loadPostComments(id);
    updateContext(id);
    // document.getElementById('loading-post').remove();
    backButton.classList.add('active');
}

function newPost() {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    postImages = [];
    openModal({
        post: true,
        buttons: [{text: 'Post', action: 'sendModalPost();closeModal();'}],
        body: `
            <div class="modal-close" onclick="closeModal()">${icon.cross}</div>
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
                        <div class="post-options" onclick="appendImageAlert();">
                            <span class="post-option">${icon.attachment}</span>
                        </div>    
                        <div class="newpost-attachments"></div>
                    </div>
                </div>
            </div>
        `
    });

    document.querySelector('.post-input').focus();

    const input = document.querySelector('.post-input');

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
}

function appendImageAlert() {
    openAlert({
        title: 'Attach an image',
        message: 'Paste the URL of the image you want to attach',
        input: true,
        buttons: [{text: 'Attach', action: `appendImage();`}, {text: 'Cancel', action: 'closeAlert()'}]
    });
}

function appendImage() {
    const response = document.getElementById('alert-input').value;
    closeAlert();
    if (response) {
        postImages.push(response);
        const attachments = document.querySelector('.newpost-attachments');
        attachments.innerHTML += `
            <div class="newpost-attachment" style="--image: url('${response}');" data-no="${postImages.indexOf(response)}">
                <div class="newpost-remove-attachment" onclick="removeImage('${postImages.indexOf(response)}')">${icon.cross}</div>
            </div>
        `;
    }
}

function removeImage(no) {
    event.stopPropagation();
    postImages.splice(no, 1);
    document.querySelector(`.newpost-attachment[data-no="${no}"]`).remove();
}

function newRepost(id) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    openModal({
        post: true,
        buttons: [{text: 'Post', action: `sendModalRepost('${id}');closeModal();`}],
        body: `
            <div class="modal-close" onclick="closeModal()">${icon.cross}</div>
            <div class="create-post">
                <div class="pfp-container">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></div>
                </div>
                <div class="create-post-container">
                    <div class="post-header">
                        <div class="post-title">${storage.get('user')}</div>
                    </div>
                    <div class="post-content">
                        <textarea placeholder="What do you think about this post?" id="post-content" class="post-input"></textarea>
                    </div>
                    <div class="post-repost" id="post-repost"></div>
                </div>
            </div>
        `
    });

    loadRepostPreview(id);

    document.querySelector('.post-input').focus();

    const input = document.querySelector('.post-input');

    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
    });

    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            sendModalRepost(id);
        }
    });
}

function newComment(id, parentid) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    openModal({
        post: true,
        buttons: [{text: 'Post', action: `sendModalComment('${id}','${parentid}');closeModal();`}],
        body: `
            <div class="modal-close" onclick="closeModal()">${icon.cross}</div>
            <div class="replying-to">
                <div class="content-center" id="preview-loading" style="padding:0.25rem;">
                <span class="loader animate">${icon.loader}</span>
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

    loadCommentPreview(id, parentid);

    document.querySelector('.post-input').focus();

    const input = document.querySelector('.post-input');

    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
    });

    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            sendModalComment(id,`${parentid}`);
        }
    });
}

function sendModalPost() {
    if (document.querySelector('.post-input').value.trim() !== '') {
        sendPost(document.querySelector('.post-input').value.trim());
    } else if (postImages.length > 0){
        sendPost('');
    }
}

function sendModalRepost(id) {
    sendPost(document.querySelector('.post-input').value.trim(), id);
}

function sendModalComment(id, parentid) {
    if (document.querySelector('.post-input').value.trim() !== '') {
        if (parentid !== 'null') { //idk why it thinks its a string but whatev it works
            sendComment(parentid, document.querySelector('.post-input').value.trim(), id);
        } else {
            sendComment(id, document.querySelector('.post-input').value.trim(), null);
        }
    }
}

function logoutModal() {
    openAlert({title: 'Log out?', message: 'Are you sure you want to log out?', buttons: [{text: 'OK', action: 'logout()'},{text: 'Cancel', action: 'closeAlert()'}], center: true})
}

function deletePostModal(id) {
    openAlert({title: 'Delete?', message: 'Are you sure you want to delete this post?', buttons: [{text: 'OK', action: `deletePost('${id}');closeAlert();`}, {text: 'Cancel', action: 'closeAlert()'}], center: true})
}

function pfpModal() {
    openModal({
        small: true,
        mx: 400,
        my: 300,
        buttons: [],
        body: `
            <div class="modal-close" onclick="closeModal()">${icon.cross}</div>
            <h3 class="modal-center-title">Upload Image</h3>
            <div class="upload-image" style="margin: auto;" onclick="editPfpModal()">
                ${icon.attachment}
                <span>Upload Image</span>
            </div>
        `
    });
}

function bannerModal() {
    openModal({
        small: true,
        mx: 400,
        my: 300,
        buttons: [],
        body: `
            <div class="modal-close" onclick="closeModal()">${icon.cross}</div>
            <h3 class="modal-center-title">Upload Image</h3>
            <div class="upload-image" style="margin: auto;" onclick="editBannerModal()">
                ${icon.attachment}
                <span>Upload Image</span>
            </div>
        `
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
                    {text: 'Cancel', action: 'closeModal()'},
                    {text: 'Save', action: 'saveCroppedPfp()', highlight: true}
                ],
                body: `
                    <div class="modal-close" onclick="closeModal()">${icon.cross}</div>
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
                    {text: 'Cancel', action: 'closeModal()'},
                    {text: 'Save', action: 'saveBanner()', highlight: true}
                ],
                body: `
                    <div class="modal-close" onclick="closeModal()">${icon.cross}</div>
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

function reportModal(id) {
    openModal({
        mx: 400,
        buttons: [
            {text: 'Cancel', action: 'closeModal()'},
            {text: 'Report', action: `sendReportModal('${id}')`, highlight: true}
        ],
        body: `
            <div class="modal-close" onclick="closeModal()">${icon.cross}</div>
            <h3 class="modal-center-title">Report Post</h3>
            <div class="post-report" id="post-repost"></div>
                <div class="context-outer" id="report-options" style="margin-top:0.5rem;">
                    <div class="context" onclick="openDropdown('report-options')" data-dropdown="report-options">
                    <span class="value" id="report-reason">Spam</span>
                    <span class="arrow right">${icon.arrow}</span>
                    </div>
                    <div class="dropdown center" style="width: 340px" id="report-options">
                        <div class="option" onclick="setReportReason('Spam');">Spam</div>
                        <div class="option" onclick="setReportReason('Harassment or abuse towards others');">Harassment or abuse towards others</div>
                        <div class="option" onclick="setReportReason('Rude, vulgar or offensive language');">Rude, vulgar or offensive language</div>
                        <div class="option" onclick="setReportReason('NSFW (sexual, alcohol, violence, gore, etc.)');">NSFW (sexual, alcohol, violence, gore, etc.)</div>
                        <div class="option" onclick="setReportReason('Scams, hacks, phishing or other malicious content');">Scams, hacks, phishing or other malicious content</div>
                        <div class="option" onclick="setReportReason('Threatening violence or real world harm');">Threatening violence or real world harm</div>
                        <div class="option" onclick="setReportReason('Illegal activity');">Illegal activity</div>
                        <div class="option" onclick="setReportReason('Self-harm/suicide');">Self-harm/suicide</div>
                        <div class="option" onclick="setReportReason('This person is too young to use wasteof');">This person is too young to use wasteof</div>
                        <div class="option" onclick="setReportReason('Other');">Other</div>
                    </div>
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