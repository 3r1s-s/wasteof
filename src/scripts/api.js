import { storage } from './storage.js';
import { setNotifications, notificationsIcon, content, splash, postImages, backButton } from '../index.js';
import { timeAgo, joinedAgo, sanitize, updateContext, dropdownListeners, repostListener } from './utils.js';
import { icon } from './icons.js';
import { openAlert, closeAlert, loggingIn, closeModal, tooltip } from './modals.js';
import { router } from './router.js';
import { settingsPage } from '../pages/settings.js';
import { haptic } from './haptics.js';
import { newComment, loginModal } from './page-helpers.js';

export const postCache = {}; // { id: { data: {...}, comments: [...] } }
export const loveCache = {}; // { id: true/false }

export const manageCache = (() => {
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

export function login(user, pass) {
    loggingIn(false);
    fetch('https://api.wasteof.money/session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: user.toLowerCase(),
            password: pass
        })
    }).then(res => res.json()).then(data => {
        if (data.token) {
            console.log("Logged in!");
            storage.set('token', data.token);
            storage.set('user', user.toLowerCase());
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

export function logout() {
    storage.delete('token');
    storage.delete('user');
    storage.delete('session');

    closeAlert();
    setTimeout(() => {
        router.navigate('/');
        window.location.reload();
    }, 200);
}

export async function fetchPost(id) {
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

export function createPost(data, isRepost, focused) {
    if (!data) return `
        <div class="post">
            <div class="post-content"><p style="font-style: italic;padding-top: 4px;">this post was deleted :(</p></div>
        </div>
    `;

    let post;
    let repost;

    if (data.repost && !isRepost) {
        repost = createPost(data.repost, true);
    }

    if (data && data.repost === null) {
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
            <div class="option" 
                data-action="edit-post" 
                data-id="${data._id}">
                <span>Edit</span>
                <span class="option-icon">${icon.edit}</span>
            </div>
            <div class="option" 
                data-action="delete-post" 
                data-id="${data._id}">
                <span>Delete</span>
                <span class="option-icon">${icon.delete}</span>
            </div>
            <div class="option" 
                data-action="pin-post" 
                data-id="${data._id}" 
                id="pin-post">
                <span>Pin</span>
                <span class="option-icon" style="width: 18px;">${icon.pin}</span>
            </div>
        ` : `
            <div class="option" 
                data-action="report-post" 
                data-id="${data._id}">
                <span>Report</span>
                <span class="option-icon">${icon.report}</span>
            </div>
        `}
        `;
    
        post = `
            <div class="post focused" id="${data._id}">
                <div class="post-container">
                    <div class="big-post-header">
                        <div class="pfp button" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');" data-action="profile" data-id="${data.poster.name}"></div>
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
                        <div class="post-loves post-info-item button ${manageCache.love(data._id) ? 'loved' : ''}" data-action="love" data-id="${data._id}">
                            <span class="icon">${icon.love}</span>
                            <span class="count">${data.loves}</span>
                        </div>
                        <div class="post-reposts post-info-item button" data-action="repost" data-id="${data._id}">
                                <span class="icon">${icon.repost}</span>
                                <span class="count">${data.reposts}</span>
                        </div>
                        <div class="post-reposts post-info-item button" data-action="comment" data-id="${data._id}">
                            <span class="icon">${icon.comment}</span>
                            <span class="count">${data.comments}</span>
                        </div>
                    </div>
                </div>
                <div class="context-outer more" id="dropdown-${data._id}">
                    <div class="context" data-dropdown="dropdown-${data._id}">
                    ${icon.more}
                    </div>
                    <div class="dropdown">
                        ${postdropdown}
                    </div>
                </div>
            </div>
        `;
    } else if (isRepost) {
        post = `
            <div class="post repost unfocused clickable" id="${data._id}" data-post-id="${data._id}">
            <div class="pfp-container">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');"></div>
            </div>
            <div class="post-container">
                <div class="post-header">
                    <div class="post-title">${data.poster.name}</div>
                    <span class="post-date">${timeAgo(data.time)}</span>
                </div>
                <div class="post-content" onclick="">${data.content}</div>
                <div class="post-repost">
                </div>
            </div>
            </div>
        `;
    } else {
    post = `
        <div class="post ${isRepost ? 'repost' : ''} ${data.pinned ? 'pinned' : ''} unfocused" id="${data._id}">
        <div class="pfp-container">
            <div class="pfp button" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');" data-action="profile" data-id="${data.poster.name}"></div>
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
                    <div class="post-loves post-info-item button ${manageCache.love(data._id) ? 'loved' : ''}" data-action="love" data-id="${data._id}">
                        <span class="icon">${icon.love}</span>
                        <span class="count">${data.loves}</span>
                    </div>
                    <div class="post-reposts post-info-item button" data-action="repost" data-id="${data._id}">
                            <span class="icon">${icon.repost}</span>
                            <span class="count">${data.reposts}</span>
                    </div>
                    <div class="post-reposts post-info-item button" data-action="comment" data-id="${data._id}">
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

export async function getTrending() {
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

    const exploreContainer = document.querySelector('.explore-posts');
    data.posts.forEach(post => {
        exploreContainer.insertAdjacentHTML('beforeend', createPost(post).trim());
    });


    const res2 = await fetch('https://api.wasteof.money/explore/users/top');
    const data2 = await res2.json();

    if (data2.error) {
        return;
    }

    document.querySelector('.explore-users').innerHTML = '';
    data2.forEach(data => {
        const temp = document.createElement('div');
        temp.innerHTML = createNameplate(data.name, true).trim();

        const userElement = temp.firstChild;
        userElement.addEventListener('click', () => {
            event.stopPropagation();
            router.navigate('/users/' + data.name);
        });

        userElement.ondragstart = () => {
            return false;
        };

        document.querySelector('.explore-users').appendChild(userElement);
    })
}

export async function getSearch(query) {
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
        document.querySelector('.explore-posts').insertAdjacentHTML('beforeend', createPost(post).trim());
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

export async function getFeed() {
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
            content.insertAdjacentHTML('beforeend', createPost(post).trim());
        });
    }
}

export async function fetchPostPage(id) {
    let post = await fetchPost(id);

    if (document.querySelector('.post-view')) {   
        document.querySelector('.post-view').innerHTML = createPost(post.data, false, true);
    }

    loadPostComments(id);
    updateContext(id);
    dropdownListeners();
    repostListener(id);
    // document.getElementById('loading-post').remove();
    backButton.classList.add('active');
}


export async function lovePost(id) {
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

export async function pinPost(id) {
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

export async function unpinPost(id) {
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

export async function deletePost(id) {
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

export async function setBio(newBio) {
    if (!storage.get('session')) {
        return;
    }

    await fetch(`https://api.wasteof.money/users/${storage.get('user')}/bio`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            authorization: `${storage.get('token')}`
        },
        body: JSON.stringify({bio: newBio})
    }).then(res => res.json()).then(data => {
        if (data.error) {
            openAlert({title: 'Error', message: data.error});
        } else {
            tooltip({icon: icon.check, title: 'Updated!'});
        }
    });
}

export async function postContext(data) {
    const pinEl = document.querySelector(`#dropdown-${data._id} #pin-post`);
    if (!pinEl) return;

    let pinHTML = `<span>Pin</span><span class="option-icon" style="width: 18px;">${icon.pin}</span>`;
    pinEl.setAttribute('data-id', data._id);
    pinEl.setAttribute('data-action', 'pin-post');
    const pinned = await loadPinned(storage.get('user'));
    if (pinned && pinned._id === data._id) {
        pinHTML = `<span>Unpin</span><span class="option-icon" style="width: 18px;">${icon.pin}</span>`;
        pinEl.setAttribute('data-action', 'unpin-post');
    }

    pinEl.innerHTML = pinHTML;
}

export function notificationBadge() {
    if (storage.get('session') === true) {
        fetch('https://api.wasteof.money/messages/count', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                authorization: `${storage.get('token')}`
            }
        }).then(res => res.json()).then(data => {
            const notifBadge = document.querySelector('.notification-badge');

            notifBadge.textContent = data.count;
            setNotifications(data.count);

            if (data.count > 0) {
                notifBadge.classList.add('active');
            } else {
                notifBadge.classList.remove('active');
            }
            notificationsIcon();
        });
    }
}

function createNameplate(user, small) {
    return `
        <div class="nameplate ${small ? 'small' : ''}" style="--image: url('https://api.wasteof.money/users/${user}/banner');">
            <div class="pfp-container">
                <div class="pfp" style="--image: url('https://api.wasteof.money/users/${user}/picture');"></div>
            </div>
            <div class="nameplate-name">${user}</div>
        </div>
    `;
}

// User

export async function loadUserPosts(user) {
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
                document.querySelector('.profile-posts').insertAdjacentHTML('beforeend', createPost(post).trim());
            });
        }
        await Promise.all(data.pinned.map(post => loadPost(post)));

        if (content.dataset.page !== 'user') {
            return;
        }

        document.getElementById('loading').remove();
        if (data.pinned.length !== 0) {
            document.querySelector('.profile-pinned').insertAdjacentHTML('beforeend', createPost(data.pinned[0]).trim());

            const pinEl = document.createElement('span');
            pinEl.classList.add('pin-indicator');
            pinEl.innerHTML = `${icon.pin}`;
            document.querySelector('.profile-pinned').appendChild(pinEl);
        }

        if (!data.last) {
            document.querySelector('.load-more').classList.remove('hide');
        }
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
        console.error(err);
    }
}

export async function loadMoreUserPosts(user) {
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

export async function loadUserInfo(user) {
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
            document.querySelector('.follow-button').addEventListener('click', () => {
                router.navigate('/settings');
            });
            document.querySelector('.follow-button').removeEventListener('click', toggleFollowButton);
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

export async function loadUserSettings(user) {
    try {
        const res = await fetch('https://api.wasteof.money/users/' + user);
        const data = await res.json();

        return data;
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
    }
}

export async function loadUserColor(user) {
    try {
        const res = await fetch('https://api.wasteof.money/users/' + user);
        const data = await res.json();

        return data.color;
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
    }
}

export async function loadPinned(user) {
    try {
        const res = await fetch('https://api.wasteof.money/users/' + user + '/posts');
        const data = await res.json();

        return data.pinned[0];
    } catch (err) {
        openAlert({title: 'Error', message: err.message});
    }
}

// Notifications

export async function loadNotifications() {
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
            const temp = document.createElement('div');
            temp.innerHTML = createNotification(message);
            const node = temp.firstElementChild;
            if (!message.post) {                
                node.addEventListener('click', e => {
                    e.stopPropagation();
                    openNotification(message);
                });
            }
            document.querySelector('.unread').append(node);
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
        const temp = document.createElement('div');
        temp.innerHTML = createNotification(message);
        const node = temp.firstElementChild;
        if (message.type === 'repost' && !message.data.post) {

        } else {
            node.addEventListener('click', e => {
                e.stopPropagation();
                openNotification(message);
            });
        }
        document.querySelector('.read').append(node);
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

export async function markAsRead() {
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
        <div class="notification">
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
            <div class="notification">
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

function openNotification(data) {
    if (data.type === 'follow') {
        router.navigate('/users/' + data.data.actor.name);
    } else if (data.type === 'repost') {
        router.navigate('/posts/' + data.data.post._id);
    } else if (data.type === 'comment') {
        router.navigate('/posts/' + data.data.comment.post);
    } else if (data.type === 'comment_reply') {
        router.navigate('/posts/' + data.data.comment.post);
    } else if (data.type === 'post_mention') {
        router.navigate('/posts/' + data.data.post);
    }
}

// Comments

export async function loadPostComments(postId) {
    fetch(`https://api.wasteof.money/posts/${postId}/comments`)
        .then(res => res.json())
        .then(data => {
            data.comments.forEach(comment => {
                manageCache.comment(postId, comment);
                document.querySelector('.post-replies').insertAdjacentHTML('beforeend', createComment(comment));
            });

            document.querySelector('.post-replies').querySelectorAll('.show-replies').forEach(el => {
                el.addEventListener('click', () => {
                    toggleReplies(el.dataset.repliesToggleId);
                })
            })

            document.querySelector('.post-replies').querySelectorAll('.reply-button').forEach(el => {
                el.addEventListener('click', () => {
                    newComment(el.dataset.commentId, el.dataset.parentId, el.dataset.postId);
                })
            })

            document.getElementById('loading').remove();
        }).catch(err => {
            openAlert({title: 'Error', message: err.message});
        });
}

function createComment(data) {
    let post;
    post = `
        <div class="post" id="${data._id}">
        <div class="pfp-container">
            <div class="pfp button" style="--image: url('https://api.wasteof.money/users/${data.poster.name}/picture');" data-action="profile" data-id="${data.poster.name}"></div>
        </div>
        <div class="post-container">
            <div class="post-header">
                <div class="post-title">${data.poster.name}</div>
                <span class="post-date">${timeAgo(data.time)}</span>
            </div>
            <div class="post-content" onclick="">${data.content}</div>
            <div class="comment-reply-buttons">
                ${data.hasReplies ? `<span class="show-replies" data-replies-toggle-id="${data._id}"><div class="show-replies-arrow">${icon.arrow}</div><div id="show-replies">Show replies</div></span>` : ''}
                <span class="reply-button" data-comment-id="${data._id}" data-post-id="${data.post}" data-parent-id="${data.parent}">Reply</span>
            </div>
            <div class="comment-replies" data-comment-id="${data._id}"></div>
        </div>
        </div>
    `;
    return post;
}

export async function loadCommentPreview(id, parentid) {
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

export async function loadRepostPreview(id) {
    fetchPost(id).then(post => {
        document.getElementById('post-repost').innerHTML = createPost(post.data, true);
    })
}

export async function sendPost(content, repost) {
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
        body: JSON.stringify({ post: `<p>${sanitize(content)}</p>${imgHtml()}`, repost: repost })
    });

    closeAlert();
    closeModal();

    postImages.clear
    
    if (postRes.ok) {
        tooltip({icon: icon.check, title: 'Posted!'});
    } else {
        tooltip({icon: icon.cross, title: 'Error'});    
    }
}

function imgHtml() {
    let html = '';
    postImages.return().forEach(img => {
        html += `<img src="${img}">`;
    });
    return html;
}

export async function sendComment(postId, content, parentid) {
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
            content: `<p>${sanitize(content)}</p>`,
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
    document.querySelector(`.comment-replies[data-comment-id="${id}"]`).classList.toggle('open');

    if (document.querySelector(`.comment-replies[data-comment-id="${id}"]`).classList.contains('open')) {
        document.querySelector(`.comment-replies[data-comment-id="${id}"]`).innerHTML = `<div class="content-center" id="loading-replies" data-replies-loading-id="${id}"><span class="loader animate">${icon.loader}</span></div>`;
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
            document.querySelector(`.comment-replies[data-comment-id="${id}"]`).innerHTML += createComment(comment);
        });

        document.querySelector(`.comment-replies[data-comment-id="${id}"]`).querySelectorAll('.show-replies').forEach(el => {
            el.addEventListener('click', () => {
                toggleReplies(el.dataset.repliesToggleId);
            })
        })

        document.querySelector(`.comment-replies[data-comment-id="${id}"]`).querySelectorAll('.reply-button').forEach(el => {
            el.addEventListener('click', () => {
                newComment(el.dataset.commentId, el.dataset.parentId, el.dataset.postId);
            })
        })

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

export async function followButton(user) {
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
        document.querySelector('.follow-button').addEventListener('click', toggleFollowButton.bind(null, user));
    } catch (error) {
        document.querySelector('.follow-button').innerText = 'Follow';
        document.querySelector('.follow-button').classList.remove('following');
    }
}
    
function toggleFollowButton(user) {
    if (document.querySelector('.follow-button').classList.contains('following')) {
        document.querySelector('.follow-button').innerText = 'Follow';
        document.querySelector('.follow-button').classList.remove('following');
    } else {
        document.querySelector('.follow-button').innerText = 'Unfollow';
        document.querySelector('.follow-button').classList.add('following');
    }
    follow(user);
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

export async function uploadPfp(dataUrl) {
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

export async function uploadBanner(dataUrl) {
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

export async function checkWom() {
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