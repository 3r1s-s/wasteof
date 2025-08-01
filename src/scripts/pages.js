function feedPage() {
    page = `feed`;

    titlebar.set(`Feed`);
    titlebar.type('large');
    titlebar.show();
    titlebar.back(``);

    navigation.show();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
    <div class="wasteof page">
        ${storage.get('session') ? `
        <div class="createpost" id="" onclick="newPost()">
            <div class="pfp-container">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');" onclick=""></div>
            </div>
            <div class="post-container">
                <div class="post-header">
                    <div class="post-title">${storage.get('user')}</div>
                </div>
                <div class="post-content" onclick="" style="opacity: 0.5;"><p>What's happening?</p></div>
            </div>
        </div>
        ` : `
        <div class="createpost" id="" onclick="navigateForward('loginPage()')">
            <span class="signed-out-text">Log in to see posts.</span>
        </div>
        `}
    <div>
    `;

    // getTrending();
    getFeed();
    pageElements();

    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
    document.querySelector('.nav').getElementsByClassName('nav-item')[0].classList.add('active');
}

function explorePage() {
    page = `explore`;

    titlebar.set(`Explore`);
    titlebar.type('large');
    titlebar.show();
    titlebar.back(``);

    navigation.show();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
    <div class="wasteof page">

    <div>
    `;

    getTrending();
    pageElements();

    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
    document.querySelector('.nav').getElementsByClassName('nav-item')[1].classList.add('active');
}

function profilePage(name) {
    page = `profile`;

    titlebar.set(``);
    titlebar.type('clear');
    titlebar.show();
    titlebar.back(`navigateBack('feedPage()')`);

    navigation.show();
    content.classList.add('max');
    content.scrollTo(0,0);
    content.style = `padding-top: 0;`;

    content.innerHTML = `
    <div class="profile-page">
        <div class="banner">
            <img src="https://api.wasteof.money/users/${name}/banner" class="profile-banner">
        </div>
        <div class="profile-info">
            <div class="profile-section">
                <img src="https://api.wasteof.money/users/${name}/picture" class="profile-picture">
                <div class="profile-name">
                    <span class="username">@${name}</span>
                </div>
            </div>
            <div class="profile-section right" style="margin-top: calc(10% + 5px);">
                <button class="follow-button" onclick="follow('${name}')">Follow</button>
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
        </div>
    </div>
    `;

    loadUserPosts(name);
    pageElements();
    loadUserInfo(name);
}

function myProfilePage() {
    page = `myprofile`;

    const name = storage.get('user');

    titlebar.set(``);
    titlebar.type('clear');
    titlebar.show();
    titlebar.back();

    navigation.show();
    content.scrollTo(0,0);
    content.classList.add('max');

    content.innerHTML = `
    <div class="profile-page">
        <div class="banner">
            <img src="https://api.wasteof.money/users/${name}/banner" class="profile-banner">
        </div>
        <div class="profile-info">
            <div class="profile-section">
                <img src="https://api.wasteof.money/users/${name}/picture" class="profile-picture">
                <div class="profile-name">
                    <span class="username">@${name}</span>
                </div>
            </div>
            <div class="profile-section" style="margin-top: calc(10% + 5px);">
                <span>Followers: <span id="followers">0</span> - Following: <span id="following">0</span></span>
            </div>
        </div>
        <div class="profile-info more">
            <span class="bio" id="bio">--</span>
            <span class="date" id="user-date">--</span>
        </div>
        <div class="edit-profile">
            <span class="button-pill">${icon.edit} Edit<span>
        </div>
        <div class="profile-pinned">
        </div>
        <div class="profile-posts">
        </div>
    </div>
    `;

    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
    document.querySelector('.nav').getElementsByClassName('nav-item')[4].classList.add('active');

    loadUserPosts(name);
    pageElements();
    loadUserInfo(name);
}

async function postPage(id, backpage) {
    pageid = id;
    page = `post`;

    titlebar.set(`Post`);
    titlebar.type('default');
    titlebar.show();
    if (backpage) {
        titlebar.back(`navigateBack('${backpage}')`);
    } else {
        titlebar.back(`navigateBack('feedPage()')`);
    }

    navigation.show();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = `padding: calc(var(--titlebar-height) - 0px + env(safe-area-inset-top)) 0 calc(var(--nav-height) + env(safe-area-inset-bottom)) 0;`;

    content.innerHTML = `
    <div class="post-page">
        <div class="post-container">
        </div>
    </div>
    <div class="post-replies"></div>
    <div class="reply-box">
        <div class="pfp" style="--image: url('https://api.wasteof.money/users/eris/picture'); width: 20px; height: 20px;"></div>
        <span id="reply-to-text">Reply to</span>
    </div>
    `;

    loadPostPage();
    loadPostComments(id);
    pageElements();
}

function notifsPage() {
    page = `notifications`;

    titlebar.set(`Notifications`);
    titlebar.type('large');
    titlebar.show();
    titlebar.back(``);

    navigation.show();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
    <div class="page">
        <span class="notif-title">Unread</span>
        <div class="unread">
        </div>
        <span class="notif-title">Read</span>
        <div class="read">
        </div>
    <div>
    `;

    loadNotifications();
    pageElements();

    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
    document.querySelector('.nav').getElementsByClassName('nav-item')[3].classList.add('active');
}

function infoPage() {
    page = `info`;

    titlebar.set(`Hello!!`);
    titlebar.type('large');
    titlebar.show();
    titlebar.back(``);

    navigation.show();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
    <div class="page">
        <span>currently under construction :3</span>
    <div>
    `;

    pageElements();

    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
    document.querySelector('.nav').getElementsByClassName('nav-item')[1].classList.add('active');
}

function installPage() {
    page = `install`

    titlebar.set(`Install`);
    titlebar.type('');
    titlebar.hide();
    titlebar.back(``);

    navigation.hide();
    content.classList.add('max');
    content.scrollTo(0,0);
    content.style = ``;

    document.body.style.background = 'var(--app-300)';

    content.innerHTML = `
    <div class="install page">
        <div class="device iphone">
            <svg width="294" height="323" viewBox="0 0 294 323" fill="none" xmlns="http://www.w3.org/2000/svg"><defs>            
                <pattern id="icon-app-iphone" patternUnits="objectBoundingBox" width="1" height="1"><image href="src/assets/images/icon-mobile.png" x="0" y="0" width="120" height="120"></image></pattern></defs>
                <g fill="currentColor" stroke="currentColor">
                    <path d="M 0.5 319.01 C 0.5 321.21 2.3 323 4.51 323 C 6.72 323 8.5 321.2 8.5 318.99 L 0.5 319.01 Z M 286 319 C 286 321.21 287.79 323 290 323 C 292.21 323 294 321.21 294 319 H 286 Z M 8.5 318.99 L 8.08 54.07 L 0.08 54.09 L 0.5 319.01 L 8.5 318.99 Z M 54.08 8 H 240 V 0 H 54.08 V 8 Z M 286 54 V 319 H 294 V 54 H 286 Z M 240 8 C 265.4 8 286 28.59 286 54 H 294 C 294 24.18 269.82 0 240 0 V 8 Z M 8.08 54.07 C 8.04 28.64 28.65 8 54.08 8 V 0 C 24.22 0 0.03 24.23 0.08 54.09 L 8.08 54.07 Z"></path>
                    <rect x="21.5" y="71.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="21.5" y="269.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="21.5" y="137.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="21.5" y="203.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="87.5" y="71.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="87.5" y="269.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="153.5" y="71.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="153.5" y="269.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="219.5" y="71.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="219.5" y="269.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="219.5" y="137.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="219.5" y="203.5" width="53" height="53" rx="15.5"></rect>
                    <rect x="102.5" y="16.5" width="89" height="25" rx="12.5"></rect>
                    <rect x="87.5" y="137.5" width="120" height="120" rx="36" stroke="none"></rect>
                </g>
                <rect x="87.5" y="137.5" width="120" height="120" fill="url(#icon-app-iphone)" rx="26"></rect>
            </svg>
        </div>
        <h1>Add wasteof to your Home Screen</h1>
        <ol class="tool-bar-tips">
            <li>Tap <b>${icon["share-ios"]}</b> in the tool bar</li>
            <li>Select <b>${icon["add-home-ios"]} Add to Home Screen</b></li>
        </ol>
        <div class="install-tooltip">
        Tap ${icon["share-ios"]}
        <svg class="icon tip-icon"><path id="icon-tip" d="M0 1c2.1 0 5.41 3.11 7.5 5.33.74.78 1.1 1.17 1.46 1.28.33.12.62.12.96.01.35-.12.72-.51 1.46-1.29C13.48 4.11 16.82 1 19 1V0H0Z" fill="currentColor"></path></svg>
        </div>
    <div>
    `;

    pageElements();
}

function themesPage() {
    page = `themes`;

    titlebar.set(`Themes`);
    titlebar.type();
    titlebar.back(`navigateBack('settingsPage()');`);

    content.classList.remove('max');
    content.scrollTo(0,0);

    content.innerHTML = `
        <div class="settings appearance">
            <div class="post" id="preview">
                <div class="pfp-container">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/eris/picture');"></div>
                </div>
                <div class="post-container">
                    <div class="post-header">
                        <div class="post-title">eris</div>
                        <span class="post-date">12h</span>
                    </div>
                    <div class="post-content" onclick="">Look at me, I'm a beautiful butterfly!</div>
                    <div class="post-repost">
                        
                    </div>
                    <div class="post-info">
                        <div class="post-loves post-info-item loved">
                            <span class="icon">${icon.love}</span>
                            <span class="count">12</span>
                        </div>
                        <div class="post-reposts post-info-item">
                                <span class="icon">${icon.repost}</span>
                                <span class="count">1</span>
                        </div>
                        <div class="post-reposts post-info-item">
                            <span class="icon">${icon.comment}</span>
                            <span class="count">4</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="theme-options">
                <div class="theme-option dark" onclick="theme.set('dark');haptic()" style="--app-500: #1d1d1dff;--app-900: #464547ff;">
                    <div class="theme-colour">
                    </div>
                    <div class="theme-name">
                        <span>Dark</span>
                    </div>
                </div>
                <div class="theme-option light" onclick="theme.set('light');haptic()">
                    <div class="theme-colour">
                    </div>
                    <div class="theme-name">
                        <span>Light</span>
                    </div>
                </div>
                <div class="theme-option catppuccin-macchiato" onclick="theme.set('catppuccin-macchiato');haptic()">
                    <div class="theme-colour">
                    </div>
                    <div class="theme-name">
                        <span>Twilight</span>
                    </div>
                </div>
                <div class="theme-option wom-blue" onclick="theme.set('wom-blue');haptic()">
                    <div class="theme-colour">
                    </div>
                    <div class="theme-name">
                        <span>Dusk</span>
                    </div>
                </div>
                </div>
            </div>
        </div>
    `;

    pageElements();
    setTheme();
}

function devicePage() {
    page = `device`;

    titlebar.set(`Device`);
    titlebar.type();
    titlebar.show();
    titlebar.back('navigateBack(`settingsPage()`)');

    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
    <div class="settings">
        <span class="settings-options-title">Device</span>
        <div class="json-block">${JSON.stringify(device, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}</div>
        <span class="settings-options-title">Settings</span>
        <div class="json-block">${JSON.stringify(storage.settings.all()).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}</div>
        <span class="settings-options-title">LocalStorage</span>
        <div class="json-block">${JSON.stringify(storage.all()).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}</div>
        <div class="settings-options">
            <div class="menu-button red" onclick="openAlert({title: 'Clear LocalStorage', message: 'Are you sure?', buttons: [{text: 'OK', action: 'storage.clear();closeAlert()'},{text: 'Cancel', action: 'closeAlert()'}]})"><span>Clear LocalStorage</span></div>
        </div>
    <div>
    `;

    pageElements();
}

function settingsPage() {
    page = `settings`;

    titlebar.set(`Settings`);
    titlebar.type('large');
    titlebar.show();
    titlebar.back(`myProfilePage()`);

    navigation.hide();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
        <div class="settings">
            <span class="settings-options-title">App</span>
            <div class="settings-options">
                <div class="menu-button" onclick="navigateForward('accountPage()')"><span>Account</span>${icon.arrow}</div>
                <div class="menu-button" onclick="navigateForward('profileSettings()')"><span>Profile</span>${icon.arrow}</div>
                <div class="menu-button" onclick="navigateForward('themesPage()')"><span>Themes</span>${icon.arrow}</div>
            </div>
            <span class="settings-options-title">Debug</span>
            <div class="settings-options">
                <div class="menu-button" onclick="navigateForward('devicePage()')"><span>Device Info</span>${icon.arrow}</div>
            </div>
        </div>
    `;

    pageElements();

    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
}

function accountPage() {
    page = `account`;

    titlebar.set(`Account`);
    titlebar.type('');
    titlebar.show();
    titlebar.back(`navigateBack('settingsPage()')`);

    navigation.hide();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
        <div class="settings">
            <div class="settings-options">
                <div class="menu-button red" onclick="openAlert({title: 'Log out?', message: 'Are you sure you want to log out?', buttons: [{text: 'OK', action: 'logout()'},{text: 'Cancel', action: 'closeAlert()'}], center: true})""><span>Log out</span></div>
            </div>
        </div>
    `;

    pageElements();

    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
}
