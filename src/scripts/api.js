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
            setTimeout(() => {
                router.navigate('/');
                window.location.reload();
            }, 200);
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
    setTimeout(() => {
        router.navigate('/');
        window.location.reload();
    }, 200);
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

function loadPost(data) {
    postCache[data._id] = {
        data: data,
        comments: [],
    };
    return fetchPost(data._id);
}

function createPost(data, isRepost, focused) {
    let post;
    let repost;

    if (data.repost && !isRepost) {
        repost = createPost(data.repost, true);
    }

    if (data.repost === null) {
        repost = `
        <div class="post repost">
            <div class="post-content"><p style="font-style: italic;padding-top: 4px;">this post was deleted :(</p></div>
        </div>
        `;
    }

    if (isRepost) {
        fetchPost(data._id);
    }

    if (focused) {
        let postdropdown = `
        ${storage.get('user') === data.poster.name ? `
            <div class="option" onclick="closeDropdown('dropdown-${data._id}');"><span>Edit</span><span class="option-icon">${icon.edit}</span></div>
            <div class="option" onclick="closeDropdown('dropdown-${data._id}');deletePostModal('${data._id}');"><span>Delete</span><span class="option-icon">${icon.delete}</span></div>
            <div class="option" id="pin-post" onclick="closeDropdown('dropdown-${data._id}');pinPost('${data._id}');"><span>Pin</span><span class="option-icon" style="width: 18px;">${icon.pin}</span></div>
        ` : `<div class="option" onclick="reportModal('${data._id}');closeDropdown('dropdown-${data._id}');"><span>Report</span><span class="option-icon">${icon.report}</span></div>`}
        `
    
        post = `
            <div class="post focused" id="${data._id}">
                <div class="post-container">
                    <div class="big-post-header">
                        <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');" onclick="router.navigate('/users/${data.poster.name}')"></div>
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
                        <div class="post-reposts post-info-item" onclick="event.stopPropagation();newRepost('${data._id}');">
                                <span class="icon">${icon.repost}</span>
                                <span class="count">${data.reposts}</span>
                        </div>
                        <div class="post-reposts post-info-item" onclick="event.stopPropagation();newComment('${data._id}', null);">
                            <span class="icon">${icon.comment}</span>
                            <span class="count">${data.comments}</span>
                        </div>
                    </div>
                </div>
                <div class="context-outer more" id="dropdown-${data._id}">
                    <div class="context" onclick="openDropdown('dropdown-${data._id}')" data-dropdown="dropdown-${data._id}">
                    ${icon.more}
                    </div>
                    <div class="dropdown">
                        ${postdropdown}
                    </div>
                </div>
            </div>
        `;
    } else {
    post = `
        <div class="post ${isRepost ? 'repost' : ''} ${data.pinned ? 'pinned' : ''} unfocused" id="${data._id}" onclick="event.stopPropagation();router.navigate('/posts/${data._id}')">
        <div class="pfp-container">
            <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');" onclick="event.stopPropagation();router.navigate('/users/${data.poster.name}')"></div>
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
                    <div class="post-reposts post-info-item" onclick="event.stopPropagation();newRepost('${data._id}');">
                            <span class="icon">${icon.repost}</span>
                            <span class="count">${data.reposts}</span>
                    </div>
                    <div class="post-reposts post-info-item" onclick="event.stopPropagation();newComment('${data._id}', null);">
                        <span class="icon">${icon.comment}</span>
                        <span class="count">${data.comments}</span>
                    </div>
                </div>
            ` : ''}
        </div>
        </div>
    `;
    }

    return post;
}

async function getTrending() {
    const res = await fetch('https://api.wasteof.money/explore/posts/trending?timeframe=day');
    const data = await res.json();

    if (data.error) {
        return;
    }

    await Promise.all(data.posts.map(post => loadPost(post)));

    if (content.dataset.page !== 'explore') {
        return;
    }

    document.getElementById('loading').remove();

    data.posts.forEach(post => {
        document.querySelector('.explore-posts').innerHTML += createPost(post);
    });

    const res2 = await fetch('https://api.wasteof.money/explore/users/top');
    const data2 = await res2.json();

    if (data2.error) {
        return;
    }

    document.querySelector('.explore-users').innerHTML = '';
    data2.forEach(data => {
        document.querySelector('.explore-users').innerHTML += createNameplate(data.name, true);
    })
}

async function getSearch(query) {
    document.querySelector('.explore-posts').innerHTML = `
        <div class="content-center" id="loading"><span class="loader animate">${icon.loader}</span></div>
    `;

    const res = await fetch('https://api.wasteof.money/search/posts?q=' + query + '&page=1');
    const data = await res.json();

    if (data.error) {
        return;
    }

    await Promise.all(data.results.map(post => loadPost(post)));

    if (content.dataset.page !== 'search') {
        return;
    }

    document.querySelector('.explore-posts').innerHTML = '';
    data.results.forEach(post => {
        document.querySelector('.explore-posts').innerHTML += createPost(post);
    });

    const res2 = await fetch('https://api.wasteof.money/search/users?q=' + query + '&page=1');
    const data2 = await res2.json();

    if (data2.error) {
        return;
    }

    document.querySelector('.explore-users').innerHTML = '';
    data2.results.forEach(data => {
        document.querySelector('.explore-users').innerHTML += createNameplate(data.name, true);
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

        if (content.dataset.page !== 'feed') {
            return;
        }

        document.getElementById('loading').remove();

        data.posts.forEach(post => {
            content.innerHTML += createPost(post);
        });
    }
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

async function pinPost(id) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    await fetch(`https://api.wasteof.money/posts/${id}/pin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        }
    });

    tooltip({icon: icon.check, title: 'Pinned!'});

    updateContext(id);
}

async function unpinPost(id) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    await fetch(`https://api.wasteof.money/posts/${id}/unpin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        }
    });

    tooltip({icon: icon.check, title: 'Unpinned!'});

    updateContext(id);
}

async function deletePost(id) {
    if (!storage.get('session')) {
        return;
    }

    await fetch(`https://api.wasteof.money/posts/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        }
    });

    tooltip({icon: icon.check, title: 'Deleted!'});
}

async function setBio(newBio) {
    if (!storage.get('session')) {
        return;
    }

    await fetch(`https://api.wasteof.money/users/${storage.get('user')}/bio`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        },
        body: JSON.stringify({content: newBio})
    });

    tooltip({icon: icon.check, title: 'Updated!'});
}

async function postContext(data) {
    const pinEl = document.querySelector(`#dropdown-${data._id} #pin-post`);
    if (!pinEl) return;

    let pinHTML = `<span>Pin</span><span class="option-icon" style="width: 18px;">${icon.pin}</span>`;
    pinEl.setAttribute('onclick', `closeDropdown('dropdown-${data._id}');pinPost('${data._id}');`);

    const pinned = await loadPinned(storage.get('user'));
    if (pinned && pinned._id === data._id) {
        pinHTML = `<span>Unpin</span><span class="option-icon" style="width: 18px;">${icon.pin}</span>`;
        pinEl.setAttribute('onclick', `closeDropdown('dropdown-${data._id}');unpinPost('${data._id}');`);
    }

    pinEl.innerHTML = pinHTML;
}

async function updateContext(id) {
    const postData = manageCache.get(id)?.data;
    if (!postData) {
        console.warn(`No cached data found for post ${id}`);
        return;
    }

    await postContext(postData);
}

// Nameplates

function notificationBadge() {
    if (storage.get('session') === true) {
        fetch('https://api.wasteof.money/messages/unread', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                authorization: `${storage.get('token')}`
            }
        }).then(res => res.json()).then(data => {
            const notifBadge = document.querySelector('.notification-badge');

            notifBadge.textContent = data.unread.length;
            notifications = data.unread.length;

            if (data.unread.length > 0) {
                notifBadge.classList.add('active');
            } else {
                notifBadge.classList.remove('active');
            }
            setNotificationsIcon();
        });
    }
}

function createNameplate(user, small) {
    return `
        <div class="nameplate ${small ? 'small' : ''}" style="--image: url('https://api.wasteof.money/users/${user}/banner');" onclick="router.navigate('/users/${user}')">
            <div class="pfp-container">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${user}/picture');"></div>
            </div>
            <div class="nameplate-name">${user}</div>
        </div>
    `;
}

// User

async function loadUserPosts(user) {
    try {
        const res = await fetch('https://api.wasteof.money/users/' + user + '/posts');
        const data = await res.json();

        if (data.error) {
            return;
        }

        await Promise.all(data.posts.map(post => loadPost(post)));

        if (content.dataset.page !== 'user') {
            return;
        }

        if (document.querySelector('.profile-posts')) {
            data.posts.forEach(post => {
                document.querySelector('.profile-posts').innerHTML += createPost(post);
            });
        }
        await Promise.all(data.pinned.map(post => loadPost(post)));

        if (content.dataset.page !== 'user') {
            return;
        }

        document.getElementById('loading').remove();
        if (data.pinned.length !== 0) {
            document.querySelector('.profile-pinned').innerHTML = createPost(data.pinned[0]);
            document.querySelector('.profile-pinned').innerHTML += `<span class="pin-indicator">${icon.pin}</span>`;
        }

        if (!data.last) {
            document.querySelector('.load-more').classList.remove('hide');
        }
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
        console.error(err);
    }
}

async function loadMoreUserPosts(user) {
// https://api.wasteof.money/users/eris/posts?page=2
    document.querySelector('.load-more').classList.add('hide');
    document.querySelector('.profile-posts').innerHTML += `
        <div class="load-more-loading" id="loading"><span class="loader animate">${icon.loader}</span></div>
    `;
    let pageno = parseInt(document.querySelector('.load-more').dataset.pageno) + 1;
    document.querySelector('.load-more').dataset.pageno = pageno;

    try {
        const res = await fetch(`https://api.wasteof.money/users/${user}/posts?page=${pageno}`);
        const data = await res.json();

        if (data.error) {
            return;
        }

        await Promise.all(data.posts.map(post => loadPost(post)));
        document.querySelector('.profile-posts').innerHTML += data.posts.map(post => createPost(post)).join('');
        if (!data.last) {
            document.querySelector('.load-more').classList.remove('hide');
        }
        document.getElementById('loading').remove();
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
        console.error(err);
    }
}

async function loadUserInfo(user) {
    try {
        const following = await fetch(`https://api.wasteof.money/users/${user}/followers/${storage.get('user')}`).then(res => res.json());
        
        if (following.error) {
            console.log(following.error);
            if (following.error === 'no to user found') {
                content.innerHTML = '<div class="error-container"><h1>404</h1><div class="error">User not found</div></div>';
            }
            return;
        }
        if (content.dataset.page !== 'user') {
            return;
        }
        if (following) {
            document.querySelector('.follow-button').innerText = 'Unfollow';
            document.querySelector('.follow-button').classList.add('following');
        } else {
            document.querySelector('.follow-button').innerText = 'Follow';
            document.querySelector('.follow-button').classList.remove('following');
        }

        if (user === storage.get('user')) {
            document.querySelector('.follow-button').innerText = 'Settings';
            document.querySelector('.follow-button').classList.remove('following');
            document.querySelector('.follow-button').setAttribute('onclick', 'router.navigate("/settings")');
        }

        const res = await fetch('https://api.wasteof.money/users/' + user);
        const data = await res.json();
        if (content.dataset.page !== 'user') {
            return;
        }
        if (document.getElementById('followers')) {
            document.getElementById('followers').innerHTML = data.stats.followers;
            document.getElementById('following').innerHTML = data.stats.following;
            document.getElementById('bio').innerHTML = data.bio;
            document.getElementById('user-date').innerText = `Joined: ${joinedAgo(data.history.joined)}`;
        }
        if (document.getElementById('profile-picture') && data.online) {
            document.getElementById('profile-picture').classList.add('online');
        }
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
    }
}

async function loadUserSettings(user) {
    try {
        const res = await fetch('https://api.wasteof.money/users/' + user);
        const data = await res.json();

        return data;
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
    }
}

async function loadUserColor(user) {
    try {
        const res = await fetch('https://api.wasteof.money/users/' + user);
        const data = await res.json();

        return data.color;
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
    }
}

async function loadPinned(user) {
    try {
        const res = await fetch('https://api.wasteof.money/users/' + user + '/posts');
        const data = await res.json();

        return data.pinned[0];
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
    }
}

// Notifications

async function loadNotifications() {
    let mark = [];

    const unreadRes = await fetch('https://api.wasteof.money/messages/unread', {
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        }
    });
    const unreadData = await unreadRes.json();

    if (content.dataset.page !== 'notifications') {
        return;
    }

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

    if (content.dataset.page !== 'notifications') {
        return;
    }

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

    document.getElementById('loading').remove();

    notificationBadge();
}

async function markAsRead() {
    let mark = [];

    const unreadRes = await fetch('https://api.wasteof.money/messages/unread', {
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        }
    });
    const unreadData = await unreadRes.json();

    unreadData.unread.forEach(message => {
        mark.push(message._id);
    });

    await fetch('https://api.wasteof.money/messages/mark/read', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`,
        },
        body: JSON.stringify({ messages: mark })
    });

    tooltip({icon: icon.check, title: 'Marked as read!'});
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
        <div class="notification" onclick="router.navigate('/posts/${data.data.comment.post}') ">
            <div class="notification-icon">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.data.actor.name}/picture');"></div>
            </div>
            <div class="notification-content">
                <span class="notification-title">${data.data.actor.name} ${notificationTypes[data.type]}</span>
                <div class="notification-post post-content">
                    ${data.data.comment ? data.data.comment.content : '<p style="font-style: italic">but the comment was deleted :(</p>'}
                </div>
            </div>
        </div>
    `;
    } else if (data.type === 'comment') {
        post = `
            <div class="notification" onclick="router.navigate('/posts/${data.data.comment.post}') ">
                <div class="notification-icon">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.data.actor.name}/picture');"></div>
                </div>
                <div class="notification-content">
                    <span class="notification-title">${data.data.actor.name} ${notificationTypes[data.type]}</span>
                    <div class="notification-post post-content">
                        ${data.data.comment.content || '<p style="font-style: italic">but the comment was deleted :(</p>'}
                    </div>
                </div>
            </div>
        `
    } else if (data.type === 'post_mention') {
        notifPost = createPost(data.data.post, true);
        post = `
            <div class="notification" onclick="router.navigate('/posts/${data.data.post}') ">
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
            <div class="notification" onclick="router.navigate('/users/${data.data.actor.name}') ">
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

// Comments

async function loadPostComments(postId) {
    fetch(`https://api.wasteof.money/posts/${postId}/comments`)
        .then(res => res.json())
        .then(data => {
            data.comments.forEach(comment => {
                manageCache.comment(postId, comment);
                document.querySelector('.post-replies').innerHTML += createComment(comment);
            });

            document.getElementById('loading').remove();
        }).catch(err => {
            openAlert({title: 'Error', message: err.message});
        });
}

function createComment(data) {
    let post;
    post = `
        <div class="post" id="${data._id}" onclick="">
        <div class="pfp-container">
            <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');" onclick="router.navigate('/users/${data.poster.name}')"></div>
        </div>
        <div class="post-container">
            <div class="post-header">
                <div class="post-title">${data.poster.name}</div>
                <span class="post-date">${timeAgo(data.time)}</span>
            </div>
            <div class="post-content" onclick="">${data.content}</div>
            <div class="comment-reply-buttons">
                ${data.hasReplies ? `<span class="show-replies" onclick="toggleReplies('${data._id}')" data-replies-toggle-id="${data._id}"><div class="show-replies-arrow">${icon.arrow}</div><div id="show-replies">Show replies</div></span>` : ''}
                <span class="reply-button" onclick="newComment('${data._id}', '${data.post}')">Reply</span>
            </div>
            <div class="comment-replies" data-comment-id="${data._id}"></div>
        </div>
        </div>
    `;
    return post;
}

async function loadCommentPreview(id, parentid) {
    fetch(`https://api.wasteof.money/${parentid ? 'comments' : 'posts'}/${id}`)
        .then(res => res.json())
        .then(data => {
            manageCache.comment(id, data);
            document.getElementById('preview-loading').remove();
            document.querySelector('.replying-to').innerHTML += createCommentPreview(data);

            document.querySelector('.reply-input').placeholder = 'Reply to ' + data.poster.name;
        }).catch(err => {
            openAlert({title: 'Error', message: err.message});
        });
}

function createCommentPreview(data) {
    let post;
    post = `
        <div class="post preview" id="${data._id}" onclick="">
        <div class="pfp-container">
            <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');"></div>
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

async function loadRepostPreview(id) {
    fetchPost(id).then(post => {
        document.getElementById('post-repost').innerHTML = createPost(post.data, true);
    })
}

async function sendPost(content, repost) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }

    loggingIn('Sending...');
    const postRes = await fetch('https://api.wasteof.money/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        },
        body: JSON.stringify({ post: `<p>${content.sanitize()}</p>${imgHtml()}`, repost: repost })
    });

    closeAlert();
    closeModal();

    postImages = [];
    
    if (postRes.ok) {
        tooltip({icon: icon.check, title: 'Posted!'});
    } else {
        tooltip({icon: icon.cross, title: 'Error'});    
    }
}

function imgHtml() {
    let html = '';
    postImages.forEach(img => {
        html += `<img src="${img}">`;
    });
    return html;
}

async function sendComment(postId, content, parentid) {
    if (!storage.get('session')) {
        loginModal();
        return;
    }
    loggingIn('Sending...');
    const commentRes = await fetch(`https://api.wasteof.money/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        },
        body: JSON.stringify({
            content: `<p>${content.sanitize()}</p>`,
            parent: parentid
        })
    });

    closeAlert();
    closeModal();
    
    if (commentRes.ok) {
        tooltip({icon: icon.check, title: 'Commented!'});
        if (router.location === `/posts/${postId}`) {
            router.navigate(`/posts/${postId}`);
        }
    } else {
        tooltip({icon: icon.cross, title: 'Error'});    
    }
}

function toggleReplies(id) {
    document.querySelector(`[data-replies-toggle-id="${id}"]`).classList.toggle('open');
    document.querySelector(`[data-comment-id="${id}"]`).classList.toggle('open');

    if (document.querySelector(`[data-comment-id="${id}"]`).classList.contains('open')) {
        document.querySelector(`[data-comment-id="${id}"]`).innerHTML = `<div class="content-center" id="loading-replies" data-replies-loading-id="${id}"><span class="loader animate">${icon.loader}</span></div>`;
        loadReplies(id);
    }

    if (document.querySelector(`[data-replies-toggle-id="${id}"]`).classList.contains('open')) {
        document.querySelector(`[data-replies-toggle-id="${id}"]`).innerHTML = `<div class="show-replies-arrow flip">${icon.arrow}</div><div id="show-replies">Hide replies</div>`;
    } else {
        document.querySelector(`[data-replies-toggle-id="${id}"]`).innerHTML = `<div class="show-replies-arrow">${icon.arrow}</div><div id="show-replies">Show replies</div>`;
    }
}

async function loadReplies(id) {
    fetch(`https://api.wasteof.money/comments/${id}/replies`)
    .then(res => res.json())
    .then(data => {
        data.comments.forEach(comment => {
            manageCache.comment(id, comment);
            document.querySelector(`[data-comment-id="${id}"]`).innerHTML += createComment(comment);
        });

        document.querySelector(`[data-replies-loading-id="${id}"]`).remove();
    })
}

async function follow(user) {
    fetch(`https://api.wasteof.money/users/${user}/followers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        }
    });
}

async function followButton(user) {
    if (user === storage.get('user')) {
        return;
    }
    try {
        const following = await fetch(`https://api.wasteof.money/users/${user}/followers/${storage.get('user')}`).then(res => res.json());
        if (following) {
            document.querySelector('.follow-button').innerText = 'Unfollow';
            document.querySelector('.follow-button').classList.add('following');
        } else {
            document.querySelector('.follow-button').innerText = 'Follow';
            document.querySelector('.follow-button').classList.remove('following');
        }
    } catch (error) {
        document.querySelector('.follow-button').innerText = 'Follow';
        document.querySelector('.follow-button').classList.remove('following');
    }
}
    
function toggleFollowButton() {
    if (document.querySelector('.follow-button').classList.contains('following')) {
        document.querySelector('.follow-button').innerText = 'Follow';
        document.querySelector('.follow-button').classList.remove('following');
    } else {
        document.querySelector('.follow-button').innerText = 'Unfollow';
        document.querySelector('.follow-button').classList.add('following');
    }
}

async function profileColor(color) {
    var colors = [
        "red",
        "orange",
        "yellow",
        "green",
        "teal",
        "cyan",
        "blue",
        "indigo",
        "purple",
        "fushia",
        "pink",
        "gray"
    ]

    fetch(`https://alpha.wasteof.money/users/${storage.get('user')}?/color=`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        },
        body: JSON.stringify({ color })
    });
    
    userColor();
}

async function uploadPfp(dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();

    const formData = new FormData();
    formData.append('picture', blob, 'pfp.png'); // name it something like pfp.png

    const response = await fetch(`https://api.wasteof.money/users/${storage.get('user')}/picture`, {
        method: 'PUT',
        headers: {
            Authorization: storage.get('token')
        },
        body: formData
    });

    if (!response.ok) {
        console.error('Upload failed:', await response.text());
    } else {
        tooltip({icon: icon.check, title: 'Uploaded!'});
    }
}

async function uploadBanner(dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();

    const formData = new FormData();
    formData.append('banner', blob, 'banner.png');

    const response = await fetch(`https://api.wasteof.money/users/${storage.get('user')}/banner`, {
        method: 'PUT',
        headers: {
            Authorization: storage.get('token')
        },
        body: formData
    });

    if (!response.ok) {
        console.error('Upload failed:', await response.text());
    } else {
        tooltip({icon: icon.check, title: 'Uploaded!'});
    }
}

async function reportPost(id, reason) {
    const postRes = await fetch(`https://api.wasteof.money/posts/${id}/report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        },
        body: JSON.stringify({ reason: reason, type: "none" })
    });
    
    if (postRes.ok) {
        tooltip({icon: icon.check, title: 'Report sent!'});
    }
}

async function checkWom() {
    const res = await fetch('https://api.wasteof.money/');
    const data = await res.json();
    if (data.ok === "ok") {
        splash.classList.remove('open');
        setTimeout(() => {
            splash.classList.add('hidden');
        }, 200);
    }
}

// Ping Notifications

setInterval(() => {
    notificationBadge();
}, 160000);