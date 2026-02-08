const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// State
let cameraConnected = false;
let previewActive = false;
let previewInterval = null;
let currentPhoto = null;
let templateLayers = [];
let currentFilters = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0
};

// Canvas context
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadGallery();
    displayPlaceholder();
});

function initializeUI() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // Camera connection
    document.getElementById('connect-btn').addEventListener('click', connectCamera);

    // Preview toggle
    document.getElementById('preview-toggle').addEventListener('change', togglePreview);

    // Capture buttons
    document.getElementById('capture-btn').addEventListener('click', capturePhoto);
    document.getElementById('countdown-btn').addEventListener('click', captureWithCountdown);

    // Filter controls
    setupFilterControls();

    // Layer controls
    document.getElementById('load-template-btn').addEventListener('click', loadTemplate);
    document.getElementById('save-template-btn').addEventListener('click', saveTemplate);
    document.getElementById('add-text-layer-btn').addEventListener('click', addTextLayer);
    document.getElementById('clear-layers-btn').addEventListener('click', clearLayers);

    // Gallery controls
    document.getElementById('refresh-gallery-btn').addEventListener('click', loadGallery);

    // Action bar
    document.getElementById('save-btn').addEventListener('click', savePhoto);
    document.getElementById('print-btn').addEventListener('click', printPhoto);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

async function connectCamera() {
    updateStatus('正在连接相机...');
    
    try {
        const result = await ipcRenderer.invoke('connect-camera');
        
        if (result.success) {
            cameraConnected = true;
            document.getElementById('connection-status').textContent = '已连接';
            document.getElementById('connection-status').classList.add('connected');
            document.getElementById('connect-btn').textContent = '已连接';
            document.getElementById('connect-btn').disabled = true;
            
            // Enable controls
            document.getElementById('capture-btn').disabled = false;
            document.getElementById('countdown-btn').disabled = false;
            document.getElementById('preview-toggle').disabled = false;
            
            updateStatus('相机连接成功！');
        } else {
            updateStatus('相机连接失败: ' + result.message, 'error');
        }
    } catch (error) {
        updateStatus('连接错误: ' + error.message, 'error');
    }
}

function togglePreview(event) {
    previewActive = event.target.checked;
    
    if (previewActive) {
        startPreview();
    } else {
        stopPreview();
    }
}

function startPreview() {
    updateStatus('启动实时预览...');
    
    previewInterval = setInterval(async () => {
        try {
            const result = await ipcRenderer.invoke('get-preview');
            if (result.success && result.preview) {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    applyFiltersToCanvas();
                    drawLayers();
                };
                img.src = result.preview;
            }
        } catch (error) {
            console.error('Preview error:', error);
        }
    }, 100); // Update preview 10 times per second
}

function stopPreview() {
    if (previewInterval) {
        clearInterval(previewInterval);
        previewInterval = null;
    }
    updateStatus('预览已停止');
}

async function capturePhoto() {
    if (!cameraConnected) {
        updateStatus('请先连接相机', 'error');
        return;
    }
    
    updateStatus('正在拍照...');
    
    try {
        // Simulate camera capture with a demo image
        createDemoPhoto();
        
        document.getElementById('save-btn').disabled = false;
        document.getElementById('print-btn').disabled = false;
        
        updateStatus('拍照成功！');
    } catch (error) {
        updateStatus('拍照失败: ' + error.message, 'error');
    }
}

async function captureWithCountdown() {
    if (!cameraConnected) {
        updateStatus('请先连接相机', 'error');
        return;
    }
    
    const seconds = parseInt(document.getElementById('countdown-seconds').value);
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumber = document.getElementById('countdown-number');
    
    countdownOverlay.classList.remove('hidden');
    
    for (let i = seconds; i > 0; i--) {
        countdownNumber.textContent = i;
        await sleep(1000);
    }
    
    countdownNumber.textContent = '📸';
    await sleep(500);
    
    countdownOverlay.classList.add('hidden');
    
    await capturePhoto();
}

function createDemoPhoto() {
    // Create a demo photo with gradient and text
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some demo content
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📷 DSLR Photo Booth', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText('Demo Photo', canvas.width / 2, canvas.height / 2 + 20);
    
    const timestamp = new Date().toLocaleString('zh-CN');
    ctx.font = '18px Arial';
    ctx.fillText(timestamp, canvas.width / 2, canvas.height / 2 + 60);
    
    // Store current photo
    currentPhoto = canvas.toDataURL('image/jpeg', 0.95);
    
    applyFiltersToCanvas();
    drawLayers();
}

function setupFilterControls() {
    const filters = ['brightness', 'contrast', 'saturation', 'blur', 'grayscale', 'sepia'];
    
    filters.forEach(filter => {
        const slider = document.getElementById(filter);
        const valueSpan = document.getElementById(`${filter}-value`);
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            currentFilters[filter] = parseInt(value);
            
            if (filter === 'blur') {
                valueSpan.textContent = `${value}px`;
            } else {
                valueSpan.textContent = `${value}%`;
            }
            
            if (currentPhoto) {
                redrawCanvas();
            }
        });
    });
    
    document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
    document.getElementById('apply-filters-btn').addEventListener('click', applyFilters);
}

function resetFilters() {
    currentFilters = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0
    };
    
    document.getElementById('brightness').value = 100;
    document.getElementById('contrast').value = 100;
    document.getElementById('saturation').value = 100;
    document.getElementById('blur').value = 0;
    document.getElementById('grayscale').value = 0;
    document.getElementById('sepia').value = 0;
    
    document.getElementById('brightness-value').textContent = '100%';
    document.getElementById('contrast-value').textContent = '100%';
    document.getElementById('saturation-value').textContent = '100%';
    document.getElementById('blur-value').textContent = '0px';
    document.getElementById('grayscale-value').textContent = '0%';
    document.getElementById('sepia-value').textContent = '0%';
    
    if (currentPhoto) {
        redrawCanvas();
    }
    
    updateStatus('滤镜已重置');
}

function applyFilters() {
    if (!currentPhoto) {
        updateStatus('请先拍摄照片', 'error');
        return;
    }
    
    currentPhoto = canvas.toDataURL('image/jpeg', 0.95);
    updateStatus('滤镜已应用');
}

function applyFiltersToCanvas() {
    const filters = [];
    
    if (currentFilters.brightness !== 100) {
        filters.push(`brightness(${currentFilters.brightness}%)`);
    }
    if (currentFilters.contrast !== 100) {
        filters.push(`contrast(${currentFilters.contrast}%)`);
    }
    if (currentFilters.saturation !== 100) {
        filters.push(`saturate(${currentFilters.saturation}%)`);
    }
    if (currentFilters.blur > 0) {
        filters.push(`blur(${currentFilters.blur}px)`);
    }
    if (currentFilters.grayscale > 0) {
        filters.push(`grayscale(${currentFilters.grayscale}%)`);
    }
    if (currentFilters.sepia > 0) {
        filters.push(`sepia(${currentFilters.sepia}%)`);
    }
    
    ctx.filter = filters.join(' ') || 'none';
}

function redrawCanvas() {
    if (!currentPhoto) return;
    
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        applyFiltersToCanvas();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        drawLayers();
    };
    img.src = currentPhoto;
}

function drawLayers() {
    templateLayers.forEach(layer => {
        if (!layer.visible) return;
        
        ctx.save();
        ctx.globalAlpha = layer.opacity || 1;
        
        if (layer.type === 'image' && layer.image) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, layer.x || 0, layer.y || 0, layer.width || canvas.width, layer.height || canvas.height);
            };
            img.src = layer.image;
        } else if (layer.type === 'text' && layer.text) {
            ctx.fillStyle = layer.color || 'white';
            ctx.font = `${layer.fontSize || 24}px ${layer.fontFamily || 'Arial'}`;
            ctx.textAlign = layer.align || 'left';
            ctx.fillText(layer.text, layer.x || 0, layer.y || 100);
        }
        
        ctx.restore();
    });
}

async function loadTemplate() {
    try {
        const result = await ipcRenderer.invoke('load-template');
        
        if (result.success) {
            if (result.type === 'template') {
                templateLayers = result.template.layers || [];
            } else if (result.type === 'image') {
                templateLayers = [{
                    type: 'image',
                    image: result.template.image,
                    x: 0,
                    y: 0,
                    width: canvas.width,
                    height: canvas.height,
                    visible: true,
                    opacity: 0.5
                }];
            }
            
            updateLayersList();
            if (currentPhoto) {
                redrawCanvas();
            }
            updateStatus('模板加载成功');
        }
    } catch (error) {
        updateStatus('模板加载失败: ' + error.message, 'error');
    }
}

async function saveTemplate() {
    if (templateLayers.length === 0) {
        updateStatus('没有图层可保存', 'error');
        return;
    }
    
    try {
        const templateData = {
            layers: templateLayers,
            version: '1.0'
        };
        
        const result = await ipcRenderer.invoke('save-template', templateData);
        
        if (result.success) {
            updateStatus('模板保存成功');
        }
    } catch (error) {
        updateStatus('模板保存失败: ' + error.message, 'error');
    }
}

function addTextLayer() {
    const text = prompt('请输入文字内容：', '示例文字');
    if (!text) return;
    
    const layer = {
        type: 'text',
        text: text,
        x: canvas.width / 2,
        y: canvas.height / 2,
        fontSize: 48,
        fontFamily: 'Arial',
        color: 'white',
        align: 'center',
        visible: true,
        opacity: 1
    };
    
    templateLayers.push(layer);
    updateLayersList();
    
    if (currentPhoto) {
        redrawCanvas();
    }
    
    updateStatus('文字图层已添加');
}

function clearLayers() {
    if (templateLayers.length === 0) {
        updateStatus('没有图层可清除', 'error');
        return;
    }
    
    if (confirm('确定要清除所有图层吗？')) {
        templateLayers = [];
        updateLayersList();
        
        if (currentPhoto) {
            redrawCanvas();
        }
        
        updateStatus('所有图层已清除');
    }
}

function updateLayersList() {
    const layersList = document.getElementById('layers-list');
    
    if (templateLayers.length === 0) {
        layersList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无图层</p>';
        return;
    }
    
    layersList.innerHTML = '';
    
    templateLayers.forEach((layer, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        
        const layerInfo = document.createElement('div');
        layerInfo.className = 'layer-info';
        
        const icon = layer.type === 'text' ? '📝' : '🖼️';
        const name = layer.type === 'text' ? layer.text : '图像层';
        
        layerInfo.innerHTML = `<span>${icon} ${name}</span>`;
        
        const layerActions = document.createElement('div');
        layerActions.innerHTML = `
            <button class="btn btn-secondary" onclick="toggleLayerVisibility(${index})">
                ${layer.visible ? '👁️' : '👁️‍🗨️'}
            </button>
            <button class="btn btn-danger" onclick="removeLayer(${index})">🗑️</button>
        `;
        
        layerItem.appendChild(layerInfo);
        layerItem.appendChild(layerActions);
        layersList.appendChild(layerItem);
    });
}

window.toggleLayerVisibility = function(index) {
    templateLayers[index].visible = !templateLayers[index].visible;
    updateLayersList();
    if (currentPhoto) {
        redrawCanvas();
    }
};

window.removeLayer = function(index) {
    templateLayers.splice(index, 1);
    updateLayersList();
    if (currentPhoto) {
        redrawCanvas();
    }
    updateStatus('图层已删除');
};

async function loadGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    const capturedPhotosDir = path.join(__dirname, 'captured_photos');
    
    try {
        if (!fs.existsSync(capturedPhotosDir)) {
            galleryGrid.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无照片</p>';
            return;
        }
        
        const files = fs.readdirSync(capturedPhotosDir);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
        
        if (imageFiles.length === 0) {
            galleryGrid.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无照片</p>';
            return;
        }
        
        galleryGrid.innerHTML = '';
        
        imageFiles.slice(-20).reverse().forEach(filename => {
            const filepath = path.join(capturedPhotosDir, filename);
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = filepath;
            img.alt = filename;
            
            galleryItem.appendChild(img);
            
            const actions = document.createElement('div');
            actions.className = 'gallery-item-actions';
            actions.innerHTML = `
                <button onclick="loadGalleryImage('${filepath}')">📷</button>
                <button onclick="printGalleryImage('${filepath}')">🖨️</button>
            `;
            
            galleryItem.appendChild(actions);
            galleryGrid.appendChild(galleryItem);
        });
        
    } catch (error) {
        console.error('Gallery load error:', error);
        galleryGrid.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">加载失败</p>';
    }
}

window.loadGalleryImage = function(filepath) {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentPhoto = canvas.toDataURL('image/jpeg', 0.95);
        
        document.getElementById('save-btn').disabled = false;
        document.getElementById('print-btn').disabled = false;
        
        updateStatus('照片已加载');
        switchTab('filters');
    };
    img.src = filepath;
};

window.printGalleryImage = async function(filepath) {
    try {
        const result = await ipcRenderer.invoke('print-image', filepath);
        if (result.success) {
            updateStatus('打印对话框已打开');
        } else {
            updateStatus('打印失败: ' + result.message, 'error');
        }
    } catch (error) {
        updateStatus('打印错误: ' + error.message, 'error');
    }
};

async function savePhoto() {
    if (!currentPhoto) {
        updateStatus('没有照片可保存', 'error');
        return;
    }
    
    try {
        const timestamp = Date.now();
        const filename = `photo_${timestamp}.jpg`;
        
        const result = await ipcRenderer.invoke('save-image', canvas.toDataURL('image/jpeg', 0.95), filename);
        
        if (result.success) {
            updateStatus('照片保存成功: ' + filename);
            loadGallery(); // Refresh gallery
        } else {
            updateStatus('保存失败: ' + result.message, 'error');
        }
    } catch (error) {
        updateStatus('保存错误: ' + error.message, 'error');
    }
}

async function printPhoto() {
    if (!currentPhoto) {
        updateStatus('没有照片可打印', 'error');
        return;
    }
    
    try {
        // First save the photo
        const timestamp = Date.now();
        const filename = `photo_${timestamp}.jpg`;
        const saveResult = await ipcRenderer.invoke('save-image', canvas.toDataURL('image/jpeg', 0.95), filename);
        
        if (saveResult.success) {
            // Then print it
            const printResult = await ipcRenderer.invoke('print-image', saveResult.filepath);
            
            if (printResult.success) {
                updateStatus('打印对话框已打开');
            } else {
                updateStatus('打印失败: ' + printResult.message, 'error');
            }
        } else {
            updateStatus('保存失败，无法打印', 'error');
        }
    } catch (error) {
        updateStatus('打印错误: ' + error.message, 'error');
    }
}

function displayPlaceholder() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#666';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('请连接相机开始使用', canvas.width / 2, canvas.height / 2);
}

function updateStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    
    if (type === 'error') {
        statusElement.style.color = '#dc3545';
    } else {
        statusElement.style.color = '#666';
    }
    
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
