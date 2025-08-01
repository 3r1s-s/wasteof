const postCache = {}; // { id: { data: {...}, comments: [...] } }
const loveCache = {}; // { id: true/false }

const manageCache = (() => {
    return {
        add(id, data) {
            if (!postCache[id]) {
                postCache[id] = { data, comments: [] };
            } else {
                postCache[id].data = data;
            }
        },
        get(id) {
            return postCache[id] || null;
        },
        love(id, state) {
            if (state !== undefined) {
                loveCache[id] = state;
            }
            return loveCache[id];
        },
        comment(id, comment) {
            if (!postCache[id]) {
                postCache[id] = { data: null, comments: [] };
            }
            postCache[id].comments.push(comment);
        },
        getComments(id) {
            return postCache[id]?.comments || [];
        },
        clear() {
            Object.keys(postCache).forEach(key => delete postCache[key]);
            Object.keys(loveCache).forEach(key => delete loveCache[key]);
        }
    };
})();

function login(user, pass) {
    fetch('https://api.wasteof.money/session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: user,
            password: pass
        })
    }).then(res => res.json()).then(data => {
        if (data.token) {
            console.log("Logged in!");
            storage.set('token', data.token);
            storage.set('user', user);
            storage.set('session', true);

            closeAlert();
            closeModal();
            feedPage();
        } else if (data.error) {
            closeAlert();
            setTimeout(() => {
                openAlert({title: 'Error', message: data.error});
            }, 500);
        }
    }).catch(error => {
        closeAlert();
        openAlert({title: 'Error', message: error.error});
    });
}

function logout() {
    storage.delete('token');
    storage.delete('user');
    storage.delete('session');

    closeAlert();
    loginModal();
    setTimeout(() => {
        feedPage();
    }, 200);
}

function loginModal() {
    openModal({ 
        body: `
        <div class="login-modal">
            <img src="src/assets/images/icon-web.png" style="width: 100px; height: 100px; user-select: none;">
            <span class="wordmark">wasteof</span>
            <div class="login-inputs blue">
                <div class="form larger"><input class="form-input" id="user" type="text" autocomplete=""><label for="user">Username</label></div>
                <div class="form larger"><input class="form-input" id="pass" type="password" autocomplete=""><label for="pass">Password</label></div>
            </div>
        </div>
        `,
        fill: true,
        buttons: [
            { text: "Cancel", action: `closeModal();` },
            { text: "Login", action: `login(document.getElementById('user').value, document.getElementById('pass').value);loggingIn();`, highlight: `true` }
        ],
        center: true
    })
}

function loadPost(data) {
    postCache[data._id] = {
        data,
        comments: [],
    };
    return fetchPost(data._id);
}

async function fetchPost(id) {
    if (!manageCache.get(id)) {
        await fetch(`https://api.wasteof.money/posts/${id}`, {
            headers: {
                authorization: storage.get('token'),
            }
        }).then(res => res.json()).then(data => {
            manageCache.add(id, data);
        }).catch(err => {
            openAlert({title: 'Error', message: err.message});
        });
    }

    if (manageCache.love(id) === undefined) {
        if (storage.get('session')) {
            await fetch(`https://api.wasteof.money/posts/${id}/loves/${storage.get('user')}`, {
                headers: {
                    authorization: storage.get('token'),
                }
            }).then(res => res.json()).then(data => {
                manageCache.love(id, data);
            }).catch(err => {
                if (err.name !== "AbortError") {
                    console.error(err);
                } else {
                    openAlert({title: 'Error', message: err.message});
                }
            });
        }
    }

    return manageCache.get(id);
}

function createPost(data, isRepost, backpage = '') {
    let post;
    let repost;

    if (data.repost && !isRepost) {
        repost = createPost(data.repost, true);
    }

    if (isRepost) {
        fetchPost(data._id);
    }

    post = `
        <div class="post ${isRepost ? 'repost' : 'hidden'} ${data.pinned ? 'pinned' : ''}" id="${data._id}" onclick="navigateForward('postPage(&quot;${data._id}&quot;, &quot;${backpage}&quot;)')">
        <div class="pfp-container">
            <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');" onclick="event.stopPropagation();navigateForward('profilePage(&quot;${data.poster.name}&quot;)')"></div>
        </div>
        <div class="post-container">
            <div class="post-header">
                <div class="post-title">${data.poster.name}</div>
                <span class="post-date">${timeAgo(data.time)}</span>
            </div>
            <div class="post-content" onclick="">${data.content}</div>
            <div class="post-repost">
                ${repost || ''}
            </div>
            ${!isRepost ? `
                <div class="post-info">
                    <div class="post-loves post-info-item ${manageCache.love(data._id) ? 'loved' : ''}" onclick="event.stopPropagation();lovePost(&quot;${data._id}&quot;);">
                        <span class="icon">${icon.love}</span>
                        <span class="count">${data.loves}</span>
                    </div>
                    <div class="post-reposts post-info-item">
                            <span class="icon">${icon.repost}</span>
                            <span class="count">${data.reposts}</span>
                    </div>
                    <div class="post-reposts post-info-item">
                        <span class="icon">${icon.comment}</span>
                        <span class="count">${data.comments}</span>
                    </div>
                </div>
            ` : ''}
        </div>
        </div>
    `;
    return post;
}

function createBigPost(data) {
    let post;
    let repost;

    if (data.repost) {
        repost = createPost(data.repost, true);
    }

    post = `
        <div class="post" id="${data._id}">
        <div class="post-container">
            <div class="big-post-header">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');" onclick="navigateForward('profilePage(&quot;${data.poster.name}&quot;)')"></div>
                <div class="post-header">
                    <div class="post-title">${data.poster.name}</div>
                    <span class="post-date">${timeAgo(data.time)}</span>
                </div>
            </div>
            <div class="post-content" onclick="">${data.content}</div>
            <div class="post-repost">
                ${repost || ''}
            </div>
            <div class="post-info">
                <div class="post-loves post-info-item ${manageCache.love(data._id) ? 'loved' : ''}" onclick="event.stopPropagation();lovePost(&quot;${data._id}&quot;);">
                    <span class="icon">${icon.love}</span>
                    <span class="count">${data.loves}</span>
                </div>
                <div class="post-reposts post-info-item">
                        <span class="icon">${icon.repost}</span>
                        <span class="count">${data.reposts}</span>
                </div>
                <div class="post-reposts post-info-item">
                    <span class="icon">${icon.comment}</span>
                    <span class="count">${data.comments}</span>
                </div>
            </div>
        </div>
        </div>
    `;
    return post;
}

function newPost() {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    openModal({ 
        body: `
        <div class="newpost-outer">
            <div class="">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></div>
            </div>
            <div class="newpost-container">
                <div class="newpost-user">${storage.get('user')}</div>
                <textarea class="postbox" placeholder="What's on your mind?"></textarea>
            </div>
        </div>
        `,
        fill: true,
        buttons: [
            { text: "Cancel", action: `closeModal();` },
            { text: "Post", action: `sendPost(document.querySelector('.postbox').value);`, highlight: `true` }
        ]
    })
}

async function getFeed() {
    if (storage.get('session')) {
        const res = await fetch(`https://api.wasteof.money/users/${storage.get('user')}/following/posts`);
        const data = await res.json();

        if (data.error) {
            openAlert({title: 'Error', message: data.error});
            return;
        }

        await Promise.all(data.posts.map(post => loadPost(post)));

        data.posts.forEach(post => {
            document.querySelector('.page').innerHTML += createPost(post);
        });

        updatePosts();
    }
}

async function getTrending() {
    const res = await fetch('https://api.wasteof.money/explore/posts/trending?timeframe=day');
    const data = await res.json();

    if (data.error) {
        return;
    }

    await Promise.all(data.posts.map(post => loadPost(post)));

    data.posts.forEach(post => {
        document.querySelector('.page').innerHTML += createPost(post);
    });

    updatePosts('explorePage()');
}

async function loadUserPosts(user) {
    try {
        const res = await fetch('https://api.wasteof.money/users/' + user + '/posts');
        const data = await res.json();

        await Promise.all(data.posts.map(post => loadPost(post)));
        if (document.querySelector('.profile-posts')) {
            data.posts.forEach(post => {
                document.querySelector('.profile-posts').innerHTML += createPost(post);
            });
        }
        await Promise.all(data.pinned.map(post => loadPost(post)));
        document.querySelector('.profile-pinned').innerHTML = createPost(data.pinned[0]);
    } catch (err) {
        if (err.name !== "AbortError") {
            console.error(err);
        } else {
            openAlert({title: 'Error', message: err.message});
        }
    }
    updatePosts();
}

async function loadUserInfo(user) {
    try {
        const res = await fetch('https://api.wasteof.money/users/' + user);
        const data = await res.json();
        if (document.getElementById('followers')) {
            document.getElementById('followers').innerHTML = data.stats.followers;
            document.getElementById('following').innerHTML = data.stats.following;
            document.getElementById('bio').innerHTML = data.bio;
            document.getElementById('user-date').innerText = `Joined: ${joinedAgo(data.history.joined)}`;
        }
    } catch (err) {
        if (err.name !== "AbortError") {
            console.error(err);
        } else {
            openAlert({title: 'Error', message: err.message});
        }
    }
    updatePosts();
}

function goToProfile() {
    if (storage.get('session')) {
        if (page === 'myprofile') {
            navigateForward('settingsPage();');
        } else {
            myProfilePage();
        }
    } else {
        loginModal();
    }
}

function loadPostPage() {
    let post = manageCache.get(pageid).data;
    if (document.querySelector('.post-container')) {   
        document.querySelector('.post-container').innerHTML = createBigPost(post, pageid);
        document.getElementById('reply-to-text').innerHTML = `Reply to ${post.poster.name}`;
    }
}

async function loadPostComments(postId) {
    fetch(`https://api.wasteof.money/posts/${postId}/comments`)
        .then(res => res.json())
        .then(data => {
            data.comments.forEach(comment => {
                manageCache.comment(postId, comment);
                document.querySelector('.post-replies').innerHTML += createComment(comment);
            });
        }).catch(err => {
            openAlert({title: 'Error', message: err.message});
        });
}

function createComment(data) {
    let post;
    post = `
        <div class="post" id="${data._id}" onclick="">
        <div class="pfp-container">
            <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');" onclick="navigateForward('profilePage(&quot;${data.poster.name}&quot;)')"></div>
        </div>
        <div class="post-container">
            <div class="post-header">
                <div class="post-title">${data.poster.name}</div>
                <span class="post-date">${timeAgo(data.time)}</span>
            </div>
            <div class="post-content" onclick="">${data.content}</div>
        </div>
        </div>
    `;
    return post;
}

async function loadNotifications() {
    let mark = [];

    const unreadRes = await fetch('https://api.wasteof.money/messages/unread', {
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        }
    });
    const unreadData = await unreadRes.json();

    if (unreadData.unread.length < 1) {
        document.querySelector('.unread').innerHTML = `<span class="empty">All caught up!</span>`;
    } else {
        unreadData.unread.forEach(message => {
            mark.push(message._id);
            document.querySelector('.unread').innerHTML += createNotification(message);
        });
    }

    const readRes = await fetch('https://api.wasteof.money/messages/read', {
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        }
    });
    const readData = await readRes.json();

    readData.read.forEach(message => {
        document.querySelector('.read').innerHTML += createNotification(message);
    });

    await fetch('https://api.wasteof.money/messages/mark/read', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`,
        },
        body: JSON.stringify({ messages: mark })
    });

    notificationBadge();
}

const notificationTypes = {
    'follow': 'followed you',
    'repost': 'reposted your post',
    'comment': 'commented on your post',
    'comment_reply': 'replied to your comment',
    'post_mention': 'mentioned you in a post'
}

function createNotification(data) {
    let post;
    let notifPost = '';

    if (data.type === 'repost') {
        notifPost = createPost(data.data.post, true);
        post = `
            <div class="notification">
                <div class="notification-icon">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.data.actor.name}/picture');"></div>
                </div>
                <div class="notification-content">
                    <span class="notification-title">${data.data.actor.name} ${notificationTypes[data.type]}</span>
                    <div class="notification-post">
                        ${notifPost}
                    </div>
                </div>
            </div>
        `
    } else if (data.type === 'comment_reply') {
    post = `
        <div class="notification">
            <div class="notification-icon">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.data.actor.name}/picture');"></div>
            </div>
            <div class="notification-content">
                <span class="notification-title">${data.data.actor.name} ${notificationTypes[data.type]}</span>
                <div class="notification-post post-content">
                    ${data.data.comment.content}
                </div>
            </div>
        </div>
    `;
    } else if (data.type === 'comment') {
        post = `
            <div class="notification">
                <div class="notification-icon">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.data.actor.name}/picture');"></div>
                </div>
                <div class="notification-content">
                    <span class="notification-title">${data.data.actor.name} ${notificationTypes[data.type]}</span>
                    <div class="notification-post post-content">
                        ${data.data.comment.content}
                    </div>
                </div>
            </div>
        `
    } else if (data.type === 'post_mention') {
        notifPost = createPost(data.data.post, true);
        post = `
            <div class="notification">
                <div class="notification-icon">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.data.actor.name}/picture');"></div>
                </div>
                <div class="notification-content">
                    <span class="notification-title">${data.data.actor.name} ${notificationTypes[data.type]}</span>
                    <div class="notification-post">
                        ${notifPost}
                    </div>
                </div>
            </div>
        `
    } else {
        post = `
            <div class="notification">
                <div class="notification-icon">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.data.actor.name}/picture');"></div>
                </div>
                <div class="notification-content">
                    <span class="notification-title">${data.data.actor.name} ${notificationTypes[data.type]}</span>
                </div>
            </div>
        `
    }

    return post;
}

function updatePosts(backpage) {
    document.querySelectorAll('.post').forEach(post => {
        const cached = manageCache.get(post.id);
        if (cached && cached.data) {
            post.outerHTML = createPost(cached.data, false, backpage);
        }
    });
    setTimeout(() => {
        showHiddenPosts();
    }, 10);
}

function showHiddenPosts() {
    document.querySelectorAll('.hidden').forEach(post => {
        post.classList.remove('hidden');
    });
}

function notificationBadge() {
    if (storage.get('session') === true) {
        fetch('https://api.wasteof.money/messages/unread', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                authorization: `${storage.get('token')}`
            }
        }).then(res => res.json()).then(data => {
            const notifBadge = document.querySelector('.nav-icon:has(.notifications) .notification-badge') || document.createElement('span');
            notifBadge.classList.add('notification-badge');
            if (!document.querySelector('.nav-icon:has(.notifications) .notification-badge')) {
                document.querySelector('.nav-icon:has(.notifications)').append(notifBadge);
            }
            notifBadge.innerHTML = data.unread.length;

            if (data.unread.length > 0) {
                notifBadge.classList.add('active');
            }
        });
    }
}

function openLink(link) {
    window.open(link, '_blank');
}

async function sendPost(content) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    const postRes = await fetch('https://api.wasteof.money/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        },
        body: JSON.stringify({ post: content })
    });

    closeModal();
}

async function lovePost(id) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    const post = document.getElementById(`${id}`);
    const loveElement = post.querySelector('.post-loves');
    const loved = loveElement.classList.toggle('loved');

    if (loved) {
        loveCache[id] = true;
        loveElement.querySelector('.count').textContent++;
    } else {
        loveCache[id] = false;
        loveElement.querySelector('.count').textContent--;
    }

    haptic();

    const postRes = await fetch(`https://api.wasteof.money/posts/${id}/loves`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        }
    });
}