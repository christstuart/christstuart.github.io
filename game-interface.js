// Unity WebGL Integration and Game Interface Management
let unityInstance = null;
let gameState = {
    playerCurrency: 0,
    currentObjective: "",
    timeRemaining: 0,
    storeItems: {
        avatars: [],
        vehicles: [],
        resources: []
    },
    selectedAvatar: null,
    selectedVehicle: null,
    objectives: [],
    tutorialStep: 0,
    settings: {
        musicVolume: 50,
        sfxVolume: 50,
        graphicsQuality: 'medium'
    }
};

// Unity Loader Configuration
const unityConfig = {
    dataUrl: "Build/WebGL.data",
    frameworkUrl: "Build/WebGL.framework.js",
    codeUrl: "Build/WebGL.wasm",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "YourCompany",
    productName: "Unity Racing Game",
    productVersion: "1.0",
    showBanner: false
};

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    initializeUnity();
    setupEventListeners();
    initializeTutorial();
});

// Unity WebGL Initialization
function initializeUnity() {
    const canvas = document.querySelector("#unity-canvas");
    const loadingBar = document.querySelector(".loading-progress-bar");
    const progressText = document.querySelector(".loading-percentage");
    
    // Create Unity instance with progress callback
    createUnityInstance(canvas, unityConfig, (progress) => {
        const percentage = Math.round(100.0 * progress);
        loadingBar.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }).then((instance) => {
        unityInstance = instance;
        onUnityLoaded();
    }).catch((message) => {
        console.error("Unity loading error:", message);
        alert("Error loading game: " + message);
    });
}

// Called when Unity is fully loaded
function onUnityLoaded() {
    // Hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    const gameContainer = document.getElementById('gameContainer');
    
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            gameContainer.style.display = 'block';
        }, 500);
    }, 1000);
    
    // Register Unity communication callbacks
    window.UpdatePlayerCurrency = updatePlayerCurrency;
    window.UpdateObjective = updateObjective;
    window.UpdateTimer = updateTimer;
    window.LoadStoreItems = loadStoreItems;
    window.LoadObjectives = loadObjectives;
    window.ShowTutorial = showTutorial;
    
    // Request initial game data from Unity
    if (unityInstance) {
        unityInstance.SendMessage('GameManager', 'RequestInitialData');
    }
}

// UI Toggle Functions
function toggleStore() {
    const modal = document.getElementById('storeModal');
    modal.classList.toggle('show');
    if (modal.classList.contains('show')) {
        loadStoreTab('avatars');
    }
}

function toggleCustomization() {
    const modal = document.getElementById('customizationModal');
    modal.classList.toggle('show');
    if (modal.classList.contains('show')) {
        loadCustomizationOptions();
    }
}

function toggleObjectives() {
    const modal = document.getElementById('objectivesModal');
    modal.classList.toggle('show');
    if (modal.classList.contains('show')) {
        displayObjectives();
    }
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.toggle('show');
}

// Store Management
function switchStoreTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load store items for selected tab
    loadStoreTab(tabName);
}

function loadStoreTab(tabName) {
    const storeItemsContainer = document.getElementById('storeItems');
    storeItemsContainer.innerHTML = '';
    
    // Get items from gameState or request from Unity
    const items = gameState.storeItems[tabName] || [];
    
    // Demo items if no Unity connection
    if (items.length === 0) {
        items.push(...generateDemoItems(tabName));
    }
    
    items.forEach(item => {
        const itemElement = createStoreItem(item);
        storeItemsContainer.appendChild(itemElement);
    });
}

function createStoreItem(item) {
    const div = document.createElement('div');
    div.className = 'store-item';
    div.innerHTML = `
        <div class="store-item-icon">
            <i class="${item.icon || 'fas fa-cube'}"></i>
        </div>
        <h4 class="store-item-name">${item.name}</h4>
        <div class="store-item-price">
            <i class="fas fa-coins"></i>
            <span>${item.price}</span>
        </div>
        <button class="buy-button" ${gameState.playerCurrency < item.price ? 'disabled' : ''} 
                onclick="purchaseItem('${item.id}', '${item.type}', ${item.price})">
            Comprar
        </button>
    `;
    return div;
}

function purchaseItem(itemId, itemType, price) {
    if (gameState.playerCurrency >= price) {
        // Send purchase request to Unity
        if (unityInstance) {
            unityInstance.SendMessage('StoreManager', 'BuyItem', itemId);
        }
        
        // Update UI optimistically
        gameState.playerCurrency -= price;
        updatePlayerCurrency(gameState.playerCurrency);
        
        // Show purchase animation
        showPurchaseSuccess(itemId);
    }
}

function showPurchaseSuccess(itemId) {
    // Create a success notification
    const notification = document.createElement('div');
    notification.className = 'purchase-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>¡Compra exitosa!</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Customization Management
function loadCustomizationOptions() {
    // Load avatar options
    const avatarContainer = document.getElementById('avatarOptions');
    avatarContainer.innerHTML = '';
    
    const avatarOptions = [
        { id: 'avatar1', name: 'Piloto Clásico', icon: 'fas fa-user' },
        { id: 'avatar2', name: 'Piloto Futurista', icon: 'fas fa-user-astronaut' },
        { id: 'avatar3', name: 'Piloto Ninja', icon: 'fas fa-user-ninja' }
    ];
    
    avatarOptions.forEach(avatar => {
        const option = createCustomOption(avatar, 'avatar');
        avatarContainer.appendChild(option);
    });
    
    // Load vehicle options
    const vehicleContainer = document.getElementById('vehicleOptions');
    vehicleContainer.innerHTML = '';
    
    const vehicleOptions = [
        { id: 'vehicle1', name: 'Deportivo', icon: 'fas fa-car' },
        { id: 'vehicle2', name: 'Todoterreno', icon: 'fas fa-truck' },
        { id: 'vehicle3', name: 'Futurista', icon: 'fas fa-rocket' }
    ];
    
    vehicleOptions.forEach(vehicle => {
        const option = createCustomOption(vehicle, 'vehicle');
        vehicleContainer.appendChild(option);
    });
}

function createCustomOption(item, type) {
    const div = document.createElement('div');
    div.className = 'custom-option';
    if ((type === 'avatar' && item.id === gameState.selectedAvatar) ||
        (type === 'vehicle' && item.id === gameState.selectedVehicle)) {
        div.classList.add('selected');
    }
    
    div.innerHTML = `
        <i class="${item.icon}"></i>
        <p>${item.name}</p>
    `;
    
    div.onclick = () => selectCustomization(item.id, type);
    return div;
}

function selectCustomization(itemId, type) {
    if (type === 'avatar') {
        gameState.selectedAvatar = itemId;
        // Send to Unity
        if (unityInstance) {
            unityInstance.SendMessage('CustomizationManager', 'SetAvatar', itemId);
        }
    } else if (type === 'vehicle') {
        gameState.selectedVehicle = itemId;
        // Send to Unity
        if (unityInstance) {
            unityInstance.SendMessage('CustomizationManager', 'SetVehicle', itemId);
        }
    }
    
    // Reload options to update selection
    loadCustomizationOptions();
}

// Objectives Management
function displayObjectives() {
    const objectivesList = document.getElementById('objectivesList');
    objectivesList.innerHTML = '';
    
    // Use demo objectives if none from Unity
    if (gameState.objectives.length === 0) {
        gameState.objectives = [
            { id: 1, text: 'Llega a la oficina', description: 'Conduce hasta el edificio de oficinas', completed: false },
            { id: 2, text: 'Recoge 10 monedas', description: 'Encuentra y recoge monedas en el camino', completed: false },
            { id: 3, text: 'Completa una carrera', description: 'Participa y termina una carrera', completed: false }
        ];
    }
    
    gameState.objectives.forEach(objective => {
        const objectiveElement = createObjectiveElement(objective);
        objectivesList.appendChild(objectiveElement);
    });
}

function createObjectiveElement(objective) {
    const div = document.createElement('div');
    div.className = `objective-item ${objective.completed ? 'completed' : ''}`;
    div.innerHTML = `
        <div class="objective-checkbox"></div>
        <div class="objective-text">
            <h4>${objective.text}</h4>
            <p>${objective.description}</p>
        </div>
    `;
    return div;
}

// Settings Management
function setupEventListeners() {
    // Music volume
    const musicSlider = document.getElementById('musicVolume');
    const musicValue = document.getElementById('musicVolumeValue');
    musicSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        gameState.settings.musicVolume = value;
        musicValue.textContent = value + '%';
        if (unityInstance) {
            unityInstance.SendMessage('MusicManager', 'SetVolume', value / 100);
        }
    });
    
    // SFX volume
    const sfxSlider = document.getElementById('sfxVolume');
    const sfxValue = document.getElementById('sfxVolumeValue');
    sfxSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        gameState.settings.sfxVolume = value;
        sfxValue.textContent = value + '%';
        if (unityInstance) {
            unityInstance.SendMessage('AudioManager', 'SetSFXVolume', value / 100);
        }
    });
    
    // Graphics quality
    const qualitySelect = document.getElementById('graphicsQuality');
    qualitySelect.addEventListener('change', (e) => {
        const quality = e.target.value;
        gameState.settings.graphicsQuality = quality;
        if (unityInstance) {
            unityInstance.SendMessage('GraphicsManager', 'SetQuality', quality);
        }
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// Tutorial Management
function initializeTutorial() {
    // Check if first time player
    const hasPlayedBefore = localStorage.getItem('hasPlayedBefore');
    if (!hasPlayedBefore) {
        setTimeout(() => {
            showTutorial();
        }, 2000);
    }
}

function showTutorial() {
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    tutorialOverlay.style.display = 'block';
    
    const tutorialSteps = [
        { title: 'Bienvenido', text: '¡Bienvenido a Unity Racing Game! Usa las teclas de flecha para conducir.' },
        { title: 'Objetivos', text: 'Completa objetivos para ganar monedas y desbloquear contenido.' },
        { title: 'Tienda', text: 'Usa tus monedas para comprar avatares, vehículos y mejoras.' },
        { title: 'Personalización', text: 'Personaliza tu avatar y vehículo en el menú de personalización.' },
        { title: '¡A jugar!', text: '¡Diviértete y buena suerte en las carreras!' }
    ];
    
    updateTutorialStep(tutorialSteps[gameState.tutorialStep]);
}

function updateTutorialStep(step) {
    document.getElementById('tutorialTitle').textContent = step.title;
    document.getElementById('tutorialText').textContent = step.text;
}

function nextTutorialStep() {
    gameState.tutorialStep++;
    
    const tutorialSteps = 5; // Total number of steps
    if (gameState.tutorialStep >= tutorialSteps) {
        // End tutorial
        document.getElementById('tutorialOverlay').style.display = 'none';
        localStorage.setItem('hasPlayedBefore', 'true');
        
        // Notify Unity
        if (unityInstance) {
            unityInstance.SendMessage('TutorialManager', 'EndTutorial');
        }
    } else {
        // Notify Unity to show next step
        if (unityInstance) {
            unityInstance.SendMessage('TutorialManager', 'NextStep');
        }
    }
}

// Unity Communication Functions (called from Unity)
function updatePlayerCurrency(amount) {
    gameState.playerCurrency = amount;
    document.getElementById('playerCurrency').textContent = amount;
}

function updateObjective(objectiveText) {
    gameState.currentObjective = objectiveText;
    document.getElementById('currentObjective').textContent = objectiveText;
}

function updateTimer(seconds) {
    gameState.timeRemaining = seconds;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timeRemaining').textContent = 
        `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function loadStoreItems(itemsJson) {
    const items = JSON.parse(itemsJson);
    gameState.storeItems = items;
}

function loadObjectives(objectivesJson) {
    const objectives = JSON.parse(objectivesJson);
    gameState.objectives = objectives;
}

// Demo data generators
function generateDemoItems(type) {
    const demoItems = {
        avatars: [
            { id: 'avatar1', name: 'Piloto Clásico', price: 100, icon: 'fas fa-user', type: 'Avatar' },
            { id: 'avatar2', name: 'Piloto Futurista', price: 250, icon: 'fas fa-user-astronaut', type: 'Avatar' },
            { id: 'avatar3', name: 'Piloto Ninja', price: 500, icon: 'fas fa-user-ninja', type: 'Avatar' }
        ],
        vehicles: [
            { id: 'vehicle1', name: 'Deportivo Clásico', price: 1000, icon: 'fas fa-car', type: 'Vehicle' },
            { id: 'vehicle2', name: 'Todoterreno 4x4', price: 1500, icon: 'fas fa-truck', type: 'Vehicle' },
            { id: 'vehicle3', name: 'Vehículo Futurista', price: 2500, icon: 'fas fa-rocket', type: 'Vehicle' }
        ],
        resources: [
            { id: 'fuel1', name: 'Combustible x10', price: 50, icon: 'fas fa-gas-pump', type: 'Resource' },
            { id: 'boost1', name: 'Turbo Boost x5', price: 150, icon: 'fas fa-bolt', type: 'Resource' },
            { id: 'repair1', name: 'Kit de Reparación', price: 200, icon: 'fas fa-wrench', type: 'Resource' }
        ]
    };
    
    return demoItems[type] || [];
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    // Shortcuts for panels
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                toggleStore();
                break;
            case 'c':
                e.preventDefault();
                toggleCustomization();
                break;
            case 'o':
                e.preventDefault();
                toggleObjectives();
                break;
            case ',':
                e.preventDefault();
                toggleSettings();
                break;
        }
    }
});

// Auto-save settings
window.addEventListener('beforeunload', () => {
    localStorage.setItem('gameSettings', JSON.stringify(gameState.settings));
});

// Load saved settings
window.addEventListener('load', () => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
        gameState.settings = JSON.parse(savedSettings);
        
        // Apply saved settings
        document.getElementById('musicVolume').value = gameState.settings.musicVolume;
        document.getElementById('musicVolumeValue').textContent = gameState.settings.musicVolume + '%';
        document.getElementById('sfxVolume').value = gameState.settings.sfxVolume;
        document.getElementById('sfxVolumeValue').textContent = gameState.settings.sfxVolume + '%';
        document.getElementById('graphicsQuality').value = gameState.settings.graphicsQuality;
    }
});

// Additional CSS for purchase notification
const style = document.createElement('style');
style.textContent = `
    .purchase-notification {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--success-color);
        color: white;
        padding: 15px 30px;
        border-radius: var(--border-radius);
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        z-index: 2000;
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);