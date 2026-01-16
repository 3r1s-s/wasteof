import { router } from '@3r1s_s/erisui';

import { iconC } from "../scripts/icons.js";
import { title, content, backButton, actionButton } from "../index.js";
import { activeTab, setTranslucentTitle, toTop } from "../scripts/utils.js"
import { getTrending } from "../scripts/api.js";

export function explorePage() {
    setTranslucentTitle(false);
    title.innerText = 'Explore';
    content.dataset.page = 'explore';
    activeTab('nav-explore');
    toTop();

    actionButton.hide();

    content.innerHTML = `
        <div class="explore">
            <div class="search">
                <div class="text-input" style="height: 44px;">
                    <input type="text" placeholder="Search" autocomplete="off">${iconC.search}
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
            <eui-loader></eui-loader>
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