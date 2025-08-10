/*
  main.js
  ------------
  This script emulates the Unity-based classes provided (ObjectiveManager, StoreManager, CustomizationManager, MusicManager, TutorialManager)
  and ties them together via a simple GameManager to run in a web page.
*/

// --- Utility Functions ------------------------------------------------------
function $(selector) {
  return document.querySelector(selector);
}

// --- ObjectiveManager -------------------------------------------------------
class ObjectiveManager {
  constructor(textElement) {
    this.textElement = textElement;
    this.allPossibleObjectives = [
      { objectiveText: 'Reach the office', isCompleted: false },
      { objectiveText: 'Collect 3 resources', isCompleted: false },
      { objectiveText: 'Deliver the package', isCompleted: false },
      { objectiveText: 'Fix the broken machine', isCompleted: false }
    ];
    this.currentObjective = null;
  }

  startRandomObjective() {
    const randomIndex = Math.floor(Math.random() * this.allPossibleObjectives.length);
    // Deep-clone to reset completion state
    this.currentObjective = JSON.parse(JSON.stringify(this.allPossibleObjectives[randomIndex]));
    this.updateUIText();
  }

  completeObjective() {
    if (this.currentObjective) {
      this.currentObjective.isCompleted = true;
      this.textElement.textContent = 'Objective Completed!';
    }
  }

  isCurrentObjectiveComplete() {
    return this.currentObjective?.isCompleted ?? false;
  }

  updateUIText() {
    if (this.currentObjective) {
      this.textElement.textContent = `Objective: ${this.currentObjective.objectiveText}`;
    }
  }
}

// --- StoreManager -----------------------------------------------------------
class StoreManager {
  constructor(containerElement, currencySpan) {
    this.containerElement = containerElement;
    this.currencySpan = currencySpan;
    this.playerCurrency = 1000;

    // Example store items
    this.allItems = [
      { itemID: 'avatar_knight', itemName: 'Knight Avatar', price: 300, itemType: 'Avatar' },
      { itemID: 'avatar_wizard', itemName: 'Wizard Avatar', price: 350, itemType: 'Avatar' },
      { itemID: 'resource_wood', itemName: 'Wood Bundle', price: 100, itemType: 'Resource' },
      { itemID: 'vehicle_car', itemName: 'Speedy Car', price: 500, itemType: 'Vehicle' }
    ];

    this.renderStore();
    this.updateCurrencyUI();
  }

  renderStore() {
    this.containerElement.innerHTML = '';
    this.allItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'store-item';
      div.innerHTML = `<h4>${item.itemName}</h4>
        <p>Price: ${item.price}</p>
        <button data-id="${item.itemID}">Buy</button>`;
      this.containerElement.appendChild(div);

      div.querySelector('button').addEventListener('click', () => this.buyItem(item.itemID));
    });
  }

  buyItem(itemID) {
    const itemToBuy = this.allItems.find(i => i.itemID === itemID);
    if (!itemToBuy) return;

    if (this.playerCurrency >= itemToBuy.price) {
      this.playerCurrency -= itemToBuy.price;
      console.log(`Purchased ${itemToBuy.itemName} successfully!`);
      alert(`You bought: ${itemToBuy.itemName}`);

      // Unlock avatar/resource/vehicle accordingly
      if (itemToBuy.itemType === 'Avatar') {
        CustomizationManager.instance.unlockAvatar(itemID);
      } else if (itemToBuy.itemType === 'Resource') {
        // Simulate resource addition
        console.log(`Added resource: ${itemID}`);
      } else if (itemToBuy.itemType === 'Vehicle') {
        CustomizationManager.instance.unlockVehicle(itemID);
      }
      this.updateCurrencyUI();
    } else {
      alert('Not enough currency');
    }
  }

  updateCurrencyUI() {
    this.currencySpan.textContent = this.playerCurrency.toString();
  }
}

// --- CustomizationManager ---------------------------------------------------
class CustomizationManager {
  constructor(avatarImg, vehicleImg) {
    this.avatarImg = avatarImg;
    this.vehicleImg = vehicleImg;

    // For singleton-like global access (mirroring Unity static Instance)
    CustomizationManager.instance = this;

    // Locked/unlocked state
    this.unlockedAvatars = ['avatar_knight']; // Knight unlocked by default
    this.unlockedVehicles = [];

    this.selectedAvatarID = 'avatar_knight';
    this.selectedVehicleID = null;

    this.loadPlayerCustomization();
  }

  unlockAvatar(avatarID) {
    if (!this.unlockedAvatars.includes(avatarID)) {
      this.unlockedAvatars.push(avatarID);
    }
  }

  unlockVehicle(vehicleID) {
    if (!this.unlockedVehicles.includes(vehicleID)) {
      this.unlockedVehicles.push(vehicleID);
    }
  }

  loadPlayerCustomization() {
    this.updateAvatarPreview();
    this.updateVehiclePreview();
  }

  updateAvatarPreview() {
    if (!this.selectedAvatarID) return;
    const src = `assets/${this.selectedAvatarID}.png`;
    this.avatarImg.src = src;
  }

  updateVehiclePreview() {
    if (!this.selectedVehicleID) return;
    const src = `assets/${this.selectedVehicleID}.png`;
    this.vehicleImg.src = src;
  }
}

// --- MusicManager -----------------------------------------------------------
class MusicManager {
  constructor(audioElement) {
    this.audioElement = audioElement;
    this.originalPlaybackRate = 1.0;
    this.tensionTimeThreshold = 30; // seconds

    // Music tracks list example
    this.musicTracks = [
      { trackName: 'default', src: 'assets/music_default.mp3' },
      { trackName: 'action', src: 'assets/music_action.mp3' }
    ];
  }

  playScenarioMusic(trackName) {
    const track = this.musicTracks.find(t => t.trackName === trackName);
    if (!track) return;
    this.audioElement.src = track.src;
    this.audioElement.playbackRate = this.originalPlaybackRate;
    this.audioElement.play();
  }

  update() {
    // Called each frame to possibly speed up music if time low
    if (!GameManager.instance) return;
    const remaining = GameManager.instance.timeRemaining;
    if (remaining <= this.tensionTimeThreshold) {
      this.fadePitch(1.2, 2);
    } else {
      this.fadePitch(this.originalPlaybackRate, 2);
    }
  }

  fadePitch(targetRate, duration) {
    const startRate = this.audioElement.playbackRate;
    const startTime = performance.now();

    const step = (now) => {
      const t = Math.min((now - startTime) / (duration * 1000), 1);
      this.audioElement.playbackRate = startRate + (targetRate - startRate) * t;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

// --- TutorialManager --------------------------------------------------------
class TutorialManager {
  constructor(panelEl, textEl, nextBtn) {
    this.panelEl = panelEl;
    this.textEl = textEl;
    this.nextBtn = nextBtn;

    this.tutorialMessages = [
      'Welcome to the game!',
      'Complete objectives to win.',
      'Purchase items in the store.',
      'Customize your avatar and vehicle.',
      'Good luck!'
    ];

    this.currentStep = 0;

    this.nextBtn.addEventListener('click', () => this.nextStep());
  }

  startTutorial() {
    this.panelEl.classList.remove('hidden');
    this.currentStep = 0;
    this.displayCurrentStep();
  }

  nextStep() {
    this.currentStep++;
    if (this.currentStep < this.tutorialMessages.length) {
      this.displayCurrentStep();
    } else {
      this.endTutorial();
    }
  }

  displayCurrentStep() {
    this.textEl.textContent = this.tutorialMessages[this.currentStep];
  }

  endTutorial() {
    this.panelEl.classList.add('hidden');
  }
}

// --- GameManager ------------------------------------------------------------
class GameManager {
  constructor() {
    GameManager.instance = this;
    this.timeRemaining = 60; // seconds
    this.timerInterval = null;

    // Instantiate subsystems
    this.objectiveManager = new ObjectiveManager($('#objective-text'));
    this.storeManager = new StoreManager($('#store-items'), $('#player-currency'));
    this.customizationManager = new CustomizationManager($('#avatar-preview'), $('#vehicle-preview'));
    this.musicManager = new MusicManager($('#music-audio'));
    this.tutorialManager = new TutorialManager($('#tutorial-panel'), $('#tutorial-text'), $('#next-tutorial-btn'));

    // Hook up UI buttons
    $('#start-scenario-btn').addEventListener('click', () => this.startNewScenario());
    $('#complete-objective-btn').addEventListener('click', () => this.completeObjective());

    // Start the tutorial on first load
    this.tutorialManager.startTutorial();
  }

  startNewScenario() {
    this.timeRemaining = 60;
    $('#time-remaining').textContent = this.timeRemaining.toString();
    $('#complete-objective-btn').disabled = false;
    this.objectiveManager.startRandomObjective();
    this.musicManager.playScenarioMusic('default');

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.update(), 1000);
  }

  completeObjective() {
    this.objectiveManager.completeObjective();
    $('#complete-objective-btn').disabled = true;
  }

  update() {
    this.timeRemaining -= 1;
    $('#time-remaining').textContent = this.timeRemaining.toString();
    this.musicManager.update();

    if (this.objectiveManager.isCurrentObjectiveComplete() && this.timeRemaining > 0) {
      this.endScenario(true);
    } else if (this.timeRemaining <= 0) {
      this.endScenario(false);
    }
  }

  endScenario(didPlayerWin) {
    clearInterval(this.timerInterval);
    $('#complete-objective-btn').disabled = true;
    this.objectiveManager.textElement.textContent = didPlayerWin ? 'You Win!' : 'Time is up!';
    alert(didPlayerWin ? 'Congratulations! You completed the objective.' : 'You lost. Try again!');
  }
}

// Kick things off once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GameManager();
});