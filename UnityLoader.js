// Unity WebGL Loader Stub
// This is a stub file for testing the web interface without a Unity WebGL build
// Replace this with the actual UnityLoader.js from your Unity WebGL build

window.createUnityInstance = function(canvas, config, onProgress) {
    console.log("Unity Loader Stub: Creating mock Unity instance");
    
    // Simulate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 0.1;
        if (onProgress) {
            onProgress(Math.min(progress, 1));
        }
        if (progress >= 1) {
            clearInterval(progressInterval);
        }
    }, 200);
    
    // Return a promise that resolves with a mock Unity instance
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockInstance = {
                SendMessage: (objectName, methodName, value) => {
                    console.log(`Unity SendMessage: ${objectName}.${methodName}(${value})`);
                    
                    // Simulate some responses
                    switch(objectName + '.' + methodName) {
                        case 'GameManager.RequestInitialData':
                            // Simulate initial data load
                            setTimeout(() => {
                                window.UpdatePlayerCurrency(1000);
                                window.UpdateObjective("Llega a la oficina");
                                window.UpdateTimer(180);
                            }, 500);
                            break;
                        
                        case 'StoreManager.BuyItem':
                            // Simulate purchase
                            console.log(`Purchasing item: ${value}`);
                            break;
                        
                        case 'CustomizationManager.SetAvatar':
                        case 'CustomizationManager.SetVehicle':
                            console.log(`Setting customization: ${value}`);
                            break;
                        
                        case 'MusicManager.SetVolume':
                        case 'AudioManager.SetSFXVolume':
                            console.log(`Setting volume: ${value}`);
                            break;
                        
                        case 'GraphicsManager.SetQuality':
                            console.log(`Setting graphics quality: ${value}`);
                            break;
                    }
                },
                
                Module: {
                    canvas: canvas
                }
            };
            
            resolve(mockInstance);
        }, 2000);
    });
};

// Mock Unity communication functions that would normally be called from Unity
window.MockUnityFunctions = {
    simulateObjectiveComplete: () => {
        const objectives = [
            { id: 1, text: 'Llega a la oficina', description: 'Conduce hasta el edificio de oficinas', completed: true },
            { id: 2, text: 'Recoge 10 monedas', description: 'Encuentra y recoge monedas en el camino', completed: false },
            { id: 3, text: 'Completa una carrera', description: 'Participa y termina una carrera', completed: false }
        ];
        window.LoadObjectives(JSON.stringify(objectives));
        window.UpdateObjective("Recoge 10 monedas");
    },
    
    simulateCurrencyGain: (amount) => {
        const currentCurrency = parseInt(document.getElementById('playerCurrency').textContent);
        window.UpdatePlayerCurrency(currentCurrency + amount);
    },
    
    simulateTimerUpdate: () => {
        let time = 180;
        setInterval(() => {
            time--;
            if (time >= 0) {
                window.UpdateTimer(time);
            }
        }, 1000);
    }
};

console.log("Unity Loader Stub loaded. Use MockUnityFunctions for testing.");