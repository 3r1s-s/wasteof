// Cropper

let cropperState = {
    scale: 1,
    posX: 0,
    posY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    imageData: null
};

function initializeCropper(imageData) {

    cropperState = {
        scale: 1,
        posX: 0,
        posY: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        imageData: null
    };

    cropperState.imageData = imageData;
    const img = document.getElementById('crop-image');
    const slider = document.getElementById('zoom-slider');
    
    // Zoom control
    slider.addEventListener('input', (e) => {
        cropperState.scale = e.target.value / 100;
        updateCropperTransform();
    });
    
    // Drag to reposition
    img.addEventListener('mousedown', startDrag);
    img.addEventListener('touchstart', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    e.preventDefault();
    cropperState.isDragging = true;
    const point = e.touches ? e.touches[0] : e;
    cropperState.startX = point.clientX - cropperState.posX;
    cropperState.startY = point.clientY - cropperState.posY;
}

function drag(e) {
    if (!cropperState.isDragging) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    cropperState.posX = point.clientX - cropperState.startX;
    cropperState.posY = point.clientY - cropperState.startY;
    updateCropperTransform();
}

function endDrag() {
    cropperState.isDragging = false;
}

function updateCropperTransform() {
    const img = document.getElementById('crop-image');
    img.style.transform = `translate(${cropperState.posX}px, ${cropperState.posY}px) scale(${cropperState.scale})`;
}

async function saveCroppedPfp() {
    const img = new Image();
    img.src = cropperState.imageData;
    await new Promise(resolve => img.onload = resolve);

    const container = document.getElementById('crop-area');
    const containerRect = container.getBoundingClientRect();
    const cropBoxSize = Math.min(containerRect.width, containerRect.height);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const outputSize = 600;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const baseScale = containerRect.width / img.width;

    const imgX = cropperState.posX + (containerRect.width - img.width * cropperState.scale * baseScale) / 2;
    const imgY = cropperState.posY + (containerRect.height - img.height * cropperState.scale * baseScale) / 2;

    const cropX = (containerRect.width - cropBoxSize) / 2;
    const cropY = (containerRect.height - cropBoxSize) / 2;

    const sx = (cropX - imgX) / (cropperState.scale * baseScale);
    const sy = (cropY - imgY) / (cropperState.scale * baseScale);
    const sWidth = cropBoxSize / (cropperState.scale * baseScale);
    const sHeight = cropBoxSize / (cropperState.scale * baseScale);

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outputSize, outputSize);

    uploadPfp(canvas.toDataURL());
    closeModal();
}

function saveBanner() {
    const img = document.getElementById('crop-image banner');
    
    uploadBanner(img.src);
    closeModal();
}
