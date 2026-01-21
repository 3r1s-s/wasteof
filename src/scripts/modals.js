import { haptic } from "./haptics.js";
import { sanitize } from "./utils.js";

const modal = document.querySelector("#app-modal");

function clearComponent(comp) {
    comp.innerHTML = '';
}

export function openModal(data) {
    if (!modal) return;
    haptic();
    clearComponent(modal);

    if (data.title) {
        const titleSpan = document.createElement('span');
        titleSpan.slot = 'header-title';
        titleSpan.textContent = data.title;
        modal.appendChild(titleSpan);
    }

    if (data.headerLeft) {
        const el = document.createRange().createContextualFragment(data.headerLeft.trim()).firstElementChild;
        if (el) {
            el.slot = 'header-left';
            modal.appendChild(el);
        }
    }

    if (data.headerRight) {
        const el = document.createRange().createContextualFragment(data.headerRight.trim()).firstElementChild;
        if (el) {
            el.slot = 'header-right';
            modal.appendChild(el);
        }
    }

    if (data.body) {
        const bodyDiv = document.createElement('div');
        bodyDiv.innerHTML = data.body;
        if (data.bodyStyle) {
            bodyDiv.style = data.bodyStyle;
        }
        modal.appendChild(bodyDiv);
    }

    if (data.buttons !== false) {
        const footer = document.createElement('div');
        footer.slot = 'footer';
        footer.className = 'modal-footer-content';

        if (Array.isArray(data.buttons)) {
            data.buttons.forEach(button => {
                const btn = document.createElement('eui-button');
                if (button.highlight) btn.setAttribute('type', 'filled');
                btn.textContent = button.text;
                btn.setAttribute('border-radius', 100);
                btn.setAttribute('width', 100);
                btn.addEventListener('click', () => {
                    if (typeof button.action === 'function') {
                        button.action();
                    } else {
                        closeModal();
                    }
                });
                footer.appendChild(btn);
            });
        } else {
            const btn = document.createElement('eui-button');
            btn.textContent = 'Close';
            btn.addEventListener('click', closeModal);
            footer.appendChild(btn);
        }
        modal.appendChild(footer);
    }

    if (data.style) {
        modal.setAttribute('style', data.style);
    } else {
        modal.removeAttribute('style');
    }

    if (data.id) {
        modal.id = data.id;
    }

    if (data.mx) modal.setAttribute('width', data.mx + 'px');
    if (data.my) modal.setAttribute('height', data.my + 'px');

    modal.className = '';
    if (data.small) modal.classList.add('small');
    if (data.post) modal.classList.add('post-modal');
    if (data.login) modal.classList.add('login-modal-colors');

    modal.open();
}

export function closeModal() {
    if (modal) modal.close();
}


export function openAlert(data) {
    const modalOuter = document.querySelector(".alert-outer");
    const modalInner = document.querySelector(".alert-inner");
    const modal = document.querySelector(".alert");

    haptic();

    document.querySelector(".alert-options").style.display = "flex";

    modalInner.innerHTML = ``;

    if (data) {
        if (data.title) {
            let titleElement = document.createElement("span");
            titleElement.classList.add("alert-header");
            titleElement.textContent = sanitize(data.title)
            modalInner.append(titleElement);
        }

        if (data.message) {
            let messageElement = document.createElement("span");
            messageElement.classList.add("alert-message");
            messageElement.textContent = sanitize(data.message)
            modalInner.append(messageElement);
        }

        if (data.input) {
            let inputElement = document.createElement("input");
            inputElement.classList.add("alert-input");
            inputElement.id = "alert-input";
            inputElement.type = "text";
            modalInner.append(inputElement);
        }

        if (data.center) {
            modal.classList.add("center");
        } else {
            modal.classList.remove("center");
        }

        if (data.id) {
            modal.id = data.id;
        } else {
            modal.id = '';
        }

        const optionsContainer = document.querySelector('.alert-options');
        optionsContainer.innerHTML = '';
        optionsContainer.style.display = 'flex';

        if (Array.isArray(data.buttons)) {
            data.buttons.forEach(button => {
                const btn = document.createElement('eui-button');
                btn.className = `modal-button ${button.highlight ? 'highlight' : ''}`;
                btn.textContent = button.text;
                btn.setAttribute('border-radius', 100);
                btn.setAttribute('width', 100);

                if (typeof button.action === 'function') {
                    btn.addEventListener('click', button.action);
                } else {
                    btn.addEventListener('click', closeAlert);
                }

                optionsContainer.appendChild(btn);
            });
        } else if (data.buttons === false) {
            optionsContainer.style.display = 'none';
        } else {
            const btn = document.createElement('eui-button');
            btn.className = 'modal-button';
            btn.textContent = 'Close';
            btn.setAttribute('border-radius', 100);
            btn.setAttribute('width', 100);
            btn.addEventListener('click', closeAlert);
            optionsContainer.appendChild(btn);
        }
    }
    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");
}

document.querySelector('.alert-outer').addEventListener("click", function (event) {
    if (!event.target.closest(".alert")) {
        if (document.querySelector('.alert').classList.contains('logging-in')) {
            return;
        }
        closeAlert();
    }
});

export function closeAlert() {
    const modalOuter = document.querySelector(".alert-outer");
    const modalInner = document.querySelector(".alert-inner");
    const modal = document.querySelector(".alert");

    modalOuter.classList.remove("open");

    setTimeout(() => {
        modalOuter.style.visibility = "hidden";
        modal.classList.remove("small");
        modal.classList.remove("logging-in");
        modalInner.innerHTML = ``;
        document.querySelector(".alert-options").innerHTML = ``;
    }, 500);
}

export function loggingIn(g) {
    openAlert({
        title: g || 'Logging in...',
        buttons: false
    });
    alert.classList.add('logging-in');
}

export function workingAlert(g) {
    openAlert({
        title: g || 'Working...',
        buttons: false
    });
    alert.classList.add('logging-in');
}

export function tooltip(data) {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.classList.remove('visible');
        setTimeout(() => {
            tooltip.remove();
        }, 1000);
    });

    const tip = document.createElement("div");
    tip.classList.add("tooltip");

    tip.innerHTML = `
        ${data.icon ? `<div>${data.icon}</div>` : ``}
        ${data.title ? `<span>${sanitize(data.title)}</span>` : ``}
    `;

    document.body.appendChild(tip);

    setTimeout(() => {
        tip.style = `visibility: visible;`;
        tip.classList.add('visible');
    }, 10);

    setTimeout(() => {
        tip.classList.remove('visible');
        setTimeout(() => {
            tip.remove();
        }, 1000);
    }, 3000);
}