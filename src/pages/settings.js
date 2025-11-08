import { icon } from "../scripts/icons.js";
import { title, content, version } from "../index.js";
import { activeTab, toTop, openDropdown, dropdownListeners, closeDropdown } from "../scripts/utils.js"
import { storage } from "../scripts/storage.js";
import { openModal, closeModal } from "../scripts/modals.js";
import { loginModal, myInfo } from "../scripts/page-helpers.js";
import { themeName, setTheme } from "../scripts/theme.js";

export function settingsPage() {
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
                    <div class="context" data-dropdown="theme">
                    <span class="value">${themeName()}</span>
                    <span class="arrow">${icon.arrow}</span>
                    </div>
                    <div class="dropdown">
                        <div class="option" data-action="set-theme" data-value="system">System</div>
                        <div class="option" data-action="set-theme" data-value="light">Light</div>
                        <div class="option" data-action="set-theme" data-value="dark">Dark</div>
                    </div>
                </div>
            </div>
        </div>
        <h3>Profile</h3>
        <div class="section profile">
            <div class="sec-in">
                <span class="sec-in-title">Profile Picture</span>
                <div class="pfp-section button" data-action="change-pfp">
                    <div class="pfp" style="--image: url('https://api.wasteof.money/users/${storage.get('user')}/picture');"></div>
                    <div class="pfp-edit">
                        <span class="edit"><span class="edit-icon">${icon.edit}</span></span>
                    </div>
                </div>
            </div>
            <div class="sec-in">
                <span class="sec-in-title">Banner</span>
                <div class="banner-section button" data-action="change-banner">
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
                <button class="section-button fit button" id="save-bio" data-action="save-bio">Save</button>
            </div>
        </div>
        <div class="section disabled">
            <span class="title" style="padding: 0 0.5rem">Profile Color</span>
            <div class="options">
                <div class="context-outer" id="color">
                    <div class="context" data-dropdown="color">
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
            <div class="options"><button class="section-button button" data-action="logout">Log Out</button></div>
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
    dropdownListeners();
    myInfo();
}