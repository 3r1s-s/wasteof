function openModal(data) {
    const modalOuter = document.querySelector(".modal-outer");
    const modalInner = document.querySelector(".modal-inner");
    const modal = document.querySelector(".modal");

    haptic();

    if (data) {
        if (data.small) {
            modal.classList.add("small");
        }
        if (data.title) {
            let titleElement = document.createElement("span");
            titleElement.classList.add("modal-header");
            titleElement.textContent = data.title.sanitize()
            modalInner.append(titleElement);
        }

        if (data.body) {
            let bodyElement = document.createElement("div");
            bodyElement.classList.add("modal-body");
            bodyElement.innerHTML = data.body;
            if (data.bodyStyle) {
                if (bodyElement) {    
                    bodyElement.style = data.bodyStyle;
                }
            }
            modalInner.append(bodyElement);
        }
        
        if (data.style) {
            modal.style = data.style;
        } else {
            modal.style = '';
        }

        if (data.id) {
            modal.id = data.id;
        } else {
            modal.id = '';
        }

        if (data.center === true) {
            modal.classList.add("center");
        } else {
            modal.classList.remove("center");
        }

        if (data.fill) {
            modal.classList.add("fill");
        }

        let buttons = ``;
        if (data.buttons) {
            data.buttons.forEach(button => {
                buttons += `<button class="modal-button ${button.highlight ? 'highlight' : ''}" onclick="${button.action}">${button.text}</button>`;
            });
        } else if (data.buttons === false) {
            buttons = ``;
            document.querySelector(".modal-options").style.display = "none";
        } else {
            buttons = `<button class="modal-button" onclick="closeModal()">Close</button>`;
        }

        document.querySelector(".modal-options").innerHTML = buttons;
    }
    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");

    let sy, my, ay;
    modal.addEventListener('touchstart', (e) => {
        ay = !modalInner.scrollTop > 0;
        sy = e.touches[0].clientY;
        my = e.touches[0].clientY;           
        modal.style.transition = 'none';
        modalInner.style = 'overscroll-behavior: none';
    });

    modal.addEventListener('touchmove', (e) => {
        my = e.touches[0].clientY;
        const dist = my - sy;
        if (dist > 0 && ay) {
            modalInner.style = 'overscroll-behavior: none';
            modal.style.transform = `translateY(${dist}px)`;
        } else {
            modalInner.style = '';
            modal.style.transform = '';
            modal.style.transition = '';
        }
    });

    modal.addEventListener('touchend', () => {
        const dist = my - sy;
        if (dist > 125 && ay) {
            modal.style.transition = '';
            modal.style.transform = 'translateY(100%)';
            closeModal();
        } else {
            modalInner.style = '';
            modal.style.transform = '';
            modal.style.transition = '';
        }
    });
}

function closeModal() {
    const modalOuter = document.querySelector(".modal-outer");
    const modalInner = document.querySelector(".modal-inner");
    const modal = document.querySelector(".modal");

    modalOuter.classList.remove("open");
    modal.style.transition = '';

    setTimeout(() => {
        modalOuter.style.visibility = "hidden";
        modal.classList.remove("small");
        modalInner.innerHTML = ``;
        document.querySelector(".modal-options").innerHTML = ``;
    }, 500);
}

function closeAlert() {
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

function openAlert(data) {
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
            titleElement.textContent = data.title.sanitize();
            modalInner.append(titleElement);
        }

        if (data.message) {
            let messageElement = document.createElement("span");
            messageElement.classList.add("alert-message");
            messageElement.textContent = data.message.sanitize();
            modalInner.append(messageElement);
        }

        if (data.id) {
            modal.id = data.id;
        } else {
            modal.id = '';
        }

        let buttons = ``;
        if (data.buttons) {
            data.buttons.forEach(button => {
                buttons += `<button class="modal-button" onclick="${button.action}">${button.text}</button>`;
            });
        } else if (data.buttons === false) {
            buttons = ``;
            document.querySelector(".alert-options").style.display = "none";
        } else {
            buttons = `<button class="modal-button" onclick="closeAlert()">Close</button>`;
        }

        if (data.center === true) {
            modal.classList.add("center");
        } else {
            modal.classList.remove("center");
        }

        document.querySelector(".alert-options").innerHTML = buttons;
    }
    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");
}

function loggingIn(g) {
    const modalOuter = document.querySelector(".alert-outer");
    const modalInner = document.querySelector(".alert-inner");
    const modal = document.querySelector(".alert");

    haptic();

    document.querySelector(".alert-options").style.display = "flex";

    modalInner.innerHTML = `
    <span class="alert-header">${g ? g : 'Logging in...'}</span>
    `;

    modal.classList.add("center");
    modal.classList.add("logging-in");

    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");
}

function openImage(url) {
    const modalOuter = document.querySelector(".view-image-outer");
    const modalInner = document.querySelector(".view-image-inner");
    const modal = document.querySelector(".view-image");

    const baseURL = url.split('?')[0];
    const fileName = baseURL.split('/').pop();

    modalInner.innerHTML = `
    <img class="image-view" src="${url}" alt="${fileName}"/>
    `;

    document.querySelector(".view-image-options").innerHTML = `
    <div class="image-option" onclick="closeImage()">${icon.cross}</div>
    <div class="image-option" onclick="shareImage('${url}')">${icon.share}</div>
    `;

    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");


    const image = document.querySelector(".image-view");
    image.setAttribute("style", "");

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const maxDragDistance = window.innerHeight / 2;

    function startDrag(e) {
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        isDragging = true;
        image.style.transition = 'none';
    }

    function onDrag(e) {
        if (!isDragging) return;

        currentY = e.touches ? e.touches[0].clientY : e.clientY;
        let dragDistance = currentY - startY;

        if (dragDistance > 0 && dragDistance <= maxDragDistance) {
            image.style.transform = `translateY(${dragDistance}px) scale(${1 - dragDistance / maxDragDistance / 2})`;
        }
    }

    function endDrag() {
        isDragging = false;

        if (currentY - startY > maxDragDistance / 2) {
            closeImage();
        } else {
            image.style.transition = 'transform 0.3s ease';
            image.style.transform = 'translateY(0)';
        }
    }

    image.addEventListener('touchstart', startDrag);
    image.addEventListener('touchmove', onDrag);
    image.addEventListener('touchend', endDrag);
}

function openVideo(url) {
    const modalOuter = document.querySelector(".view-image-outer");
    const modalInner = document.querySelector(".view-image-inner");
    const modal = document.querySelector(".view-image");

    const baseURL = url.split('?')[0];
    const fileName = baseURL.split('/').pop();

    modalInner.innerHTML = `
    <video class="image-view" src="${url}" alt="${fileName}" autoplay controlsList="nodownload nofullscreen noremoteplayback"/></video>
    `;

    document.querySelector(".view-image-options").innerHTML = `
    <div class="image-option" onclick="closeImage()">${icon.cross}</div>
    <div class="image-option" onclick="shareImage('${url}')">${icon.share}</div>
    `;

    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");


    const image = document.querySelector(".image-view");
    image.setAttribute("style", "");

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const maxDragDistance = window.innerHeight / 2;

    function startDrag(e) {
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        isDragging = true;
        image.style.transition = 'none';
    }

    function onDrag(e) {
        if (!isDragging) return;

        currentY = e.touches ? e.touches[0].clientY : e.clientY;
        let dragDistance = currentY - startY;

        if (dragDistance > 0 && dragDistance <= maxDragDistance) {
            image.style.transform = `translateY(${dragDistance}px) scale(${1 - dragDistance / maxDragDistance / 2})`;
        }
    }

    function endDrag() {
        isDragging = false;

        if (currentY - startY > maxDragDistance / 2) {
            closeImage();
        } else {
            image.style.transition = 'transform 0.3s ease';
            image.style.transform = 'translateY(0)';
        }
    }

    image.addEventListener('touchstart', startDrag);
    image.addEventListener('touchmove', onDrag);
    image.addEventListener('touchend', endDrag);
}

function closeImage() {
    const modalOuter = document.querySelector(".view-image-outer");
    const modalInner = document.querySelector(".view-image-inner");
    const modal = document.querySelector(".view-image");
    const image = document.querySelector(".image-view");
    modalOuter.classList.remove("open");

    const video = document.querySelector("video.image-view");
    if (video ) {
        video.pause();
    }

    setTimeout(() => {
        if (video ) {
            video.removeAttribute("src");
            video.load();
        }
        modalOuter.style.visibility = "hidden";
        modalInner.innerHTML = ``;
        document.querySelector(".view-image-options").innerHTML = ``;
    }, 350);
}

function tooltip(data) {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.classList.remove('visible');
        setTimeout(() => {
            tooltip.remove();
        }, 1000);
    });

    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");

    tooltip.innerHTML = `
        ${data.icon ? `<div>${data.icon}</div>` : ``}
        ${data.title ? `<span>${data.title.sanitize()}</span>` : ``}
    `;
    
    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.style = `visibility: visible;`;
        tooltip.classList.add('visible');
    }, 10);

    setTimeout(() => {
        tooltip.classList.remove('visible');
        setTimeout(() => {
            tooltip.remove();
        }, 1000);
    }, 3000);
}

async function shareImage(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const filesArray = [
      new File(
        [blob],
        url.split('/').pop(),
        {
          type: "image/jpeg",
          lastModified: new Date().getTime()
        }
     )
    ];

    let shareData = {
      files: filesArray,
    };

    if (!navigator.canShare) {
      closeImage();
      openAlert({
          title: 'Error',
          message: `Share API Unavailable`
      })
      return;
    }

    if (!navigator.canShare(shareData)) {
      closeImage();
      openAlert({
          title: 'Error',
          message: `Share data unavailable or invalid`
      })
      return;
    }
    navigator.share(shareData)
}

// tooltip({'title':"Copied!",'icon':icon.copy})