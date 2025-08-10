/*
  Mini web version of the Unity systems shown in the screenshots.
  Implements: ObjectiveManager, StoreManager, PlayerDataManager, ResourceManager,
  CustomizationManager, MusicManager, TutorialManager, and a small GameManager.
*/

// ---------- Utilities ----------
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function formatSeconds(seconds) {
  const clamped = Math.max(0, Math.floor(seconds));
  const min = String(Math.floor(clamped / 60)).padStart(2, "0");
  const sec = String(clamped % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

// ---------- Player & Resources ----------
class PlayerDataManager {
  static instance = new PlayerDataManager();

  constructor() {
    this.saveKey = "webgame_player_data_v1";
    this.playerCurrency = 150;
    this.selectedAvatarID = "avatar1";
    this.selectedVehicleID = "vehicle1";
    this.unlockedAvatars = new Set(["avatar1"]);
    this.unlockedVehicles = new Set(["vehicle1"]);
    this.resources = {}; // { resourceId: count }
    this.load();
  }

  addCurrency(amount) {
    const previous = this.playerCurrency;
    this.playerCurrency = Math.max(0, previous + amount);
    this.save();
    UI.updateCurrency(this.playerCurrency);
  }

  unlockAvatar(avatarId) {
    this.unlockedAvatars.add(avatarId);
    this.save();
  }

  unlockVehicle(vehicleId) {
    this.unlockedVehicles.add(vehicleId);
    this.save();
  }

  addResource(resourceId, quantity) {
    const prev = this.resources[resourceId] || 0;
    this.resources[resourceId] = prev + quantity;
    this.save();
    UI.renderResources(this.resources);
  }

  selectAvatar(avatarId) {
    this.selectedAvatarID = avatarId;
    this.save();
  }

  selectVehicle(vehicleId) {
    this.selectedVehicleID = vehicleId;
    this.save();
  }

  resetSave() {
    localStorage.removeItem(this.saveKey);
    Object.assign(this, new PlayerDataManager());
    UI.updateCurrency(this.playerCurrency);
    UI.renderResources(this.resources);
  }

  save() {
    const data = {
      playerCurrency: this.playerCurrency,
      selectedAvatarID: this.selectedAvatarID,
      selectedVehicleID: this.selectedVehicleID,
      unlockedAvatars: Array.from(this.unlockedAvatars),
      unlockedVehicles: Array.from(this.unlockedVehicles),
      resources: this.resources,
    };
    localStorage.setItem(this.saveKey, JSON.stringify(data));
  }

  load() {
    const stored = localStorage.getItem(this.saveKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      this.playerCurrency = parsed.playerCurrency ?? this.playerCurrency;
      this.selectedAvatarID = parsed.selectedAvatarID ?? this.selectedAvatarID;
      this.selectedVehicleID = parsed.selectedVehicleID ?? this.selectedVehicleID;
      this.unlockedAvatars = new Set(parsed.unlockedAvatars ?? Array.from(this.unlockedAvatars));
      this.unlockedVehicles = new Set(parsed.unlockedVehicles ?? Array.from(this.unlockedVehicles));
      this.resources = parsed.resources ?? {};
    } catch (err) {
      console.warn("Failed to load save; using defaults.", err);
    }
  }
}

class ResourceManager {
  static instance = new ResourceManager();
  addResource(resourceId, quantity) {
    PlayerDataManager.instance.addResource(resourceId, quantity);
  }
}

// ---------- Objective System ----------
class ObjectiveManager {
  static instance = new ObjectiveManager();

  constructor() {
    this.allPossibleObjectives = [
      "Llegar a la oficina",
      "Entregar el paquete",
      "Ayudar al pasajero",
      "Reparar el tranvía",
      "Limpiar la estación",
    ];
    this.currentObjective = null;
  }

  startRandomObjective() {
    const index = Math.floor(Math.random() * this.allPossibleObjectives.length);
    this.currentObjective = { objectiveText: this.allPossibleObjectives[index], isCompleted: false };
    UI.setObjectiveText(this.currentObjective.objectiveText);
  }

  completeObjective() {
    if (!this.currentObjective) return;
    this.currentObjective.isCompleted = true;
    UI.setObjectiveText("¡Objetivo completado!");
  }

  isCurrentObjectiveComplete() {
    return this.currentObjective?.isCompleted ?? false;
  }

  getCurrentObjectiveText() {
    return this.currentObjective?.objectiveText ?? "";
  }
}

// ---------- Store ----------
class StoreManager {
  static instance = new StoreManager();

  constructor() {
    this.allItems = [
      { itemID: "avatar1", itemName: "Ava Azul", price: 0, itemType: "Avatar" },
      { itemID: "avatar2", itemName: "Ava Verde", price: 60, itemType: "Avatar" },
      { itemID: "avatar3", itemName: "Ava Rojo", price: 60, itemType: "Avatar" },
      { itemID: "vehicle1", itemName: "Tranvía Clásico", price: 0, itemType: "Vehicle" },
      { itemID: "vehicle2", itemName: "Tranvía Futurista", price: 100, itemType: "Vehicle" },
      { itemID: "fuel", itemName: "Combustible", price: 25, itemType: "Resource" },
      { itemID: "parts", itemName: "Repuestos", price: 35, itemType: "Resource" },
    ];
  }

  buyItem(itemID) {
    const item = this.allItems.find((i) => i.itemID === itemID);
    if (!item) return;

    const player = PlayerDataManager.instance;
    if (player.playerCurrency < item.price) {
      UI.toast("No tienes suficiente dinero.");
      return;
    }

    player.addCurrency(-item.price);
    if (item.itemType === "Avatar") {
      player.unlockAvatar(item.itemID);
      UI.toast(`Has comprado ${item.itemName}.`);
      UI.renderAvatars();
    } else if (item.itemType === "Vehicle") {
      player.unlockVehicle(item.itemID);
      UI.toast(`Has comprado ${item.itemName}.`);
      UI.renderVehicles();
    } else if (item.itemType === "Resource") {
      ResourceManager.instance.addResource(item.itemID, 1);
      UI.toast(`+1 ${item.itemName}`);
    }
    UI.updateCurrency(player.playerCurrency);
  }
}

// ---------- Customization ----------
class CustomizationManager {
  static instance = new CustomizationManager();

  render() {
    UI.renderAvatars();
    UI.renderVehicles();
  }

  loadPlayerCustomization() {
    const player = PlayerDataManager.instance;
    UI.highlightSelected("avatar", player.selectedAvatarID);
    UI.highlightSelected("vehicle", player.selectedVehicleID);
  }
}

// ---------- Music ----------
class MusicManager {
  static instance = new MusicManager();

  constructor() {
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
    this.originalFrequency = 220; // A3-ish base tone
    this.currentFrequency = this.originalFrequency;
    this.tensionTimeThreshold = 15; // seconds
    this.isPlaying = false;
  }

  ensureContext() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.05; // quiet background tone
    this.gainNode.connect(this.audioContext.destination);
  }

  play() {
    this.ensureContext();
    if (this.isPlaying) return;
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = "sawtooth";
    this.oscillator.frequency.value = this.originalFrequency;
    this.currentFrequency = this.originalFrequency;
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;
    try { this.oscillator.stop(); } catch {}
    this.oscillator.disconnect();
    this.oscillator = null;
    this.isPlaying = false;
  }

  setMuted(muted) {
    this.ensureContext();
    this.gainNode.gain.value = muted ? 0 : 0.05;
  }

  updateWithTimeRemaining(timeRemaining) {
    if (!this.isPlaying || !this.oscillator) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const target = timeRemaining <= this.tensionTimeThreshold ? this.originalFrequency * 1.25 : this.originalFrequency;
    if (Math.abs(target - this.currentFrequency) < 0.5) return;

    const duration = 2.0; // seconds
    this.oscillator.frequency.cancelScheduledValues(now);
    this.oscillator.frequency.setValueAtTime(this.currentFrequency, now);
    this.oscillator.frequency.linearRampToValueAtTime(target, now + duration);
    this.currentFrequency = target;
  }
}

// ---------- Tutorial ----------
class TutorialManager {
  static instance = new TutorialManager();

  constructor() {
    this.messages = [
      "Bienvenido. Pulsa 'Iniciar escenario' para comenzar.",
      "Compra artículos en la tienda para desbloquear avatares o vehículos.",
      "Haz clic en un avatar/vehículo desbloqueado para seleccionarlo.",
      "Completa el objetivo antes de que el tiempo llegue a 0. ¡La música te avisará!",
    ];
    this.currentStep = 0;
    this.saveKey = "webgame_tutorial_completed";
  }

  maybeStart() {
    const completed = localStorage.getItem(this.saveKey);
    if (completed) return;
    UI.showTutorial(this.messages[0]);
  }

  nextStep() {
    this.currentStep += 1;
    if (this.currentStep < this.messages.length) {
      UI.showTutorial(this.messages[this.currentStep]);
    } else {
      UI.hideTutorial();
      localStorage.setItem(this.saveKey, "1");
    }
  }
}

// ---------- Game Manager ----------
class GameManager {
  static instance = new GameManager();

  constructor() {
    this.timeRemaining = 0;
    this.timerInterval = null;
    this.scenarioActive = false;
  }

  startNewScenario() {
    if (this.scenarioActive) this.stopScenario();

    ObjectiveManager.instance.startRandomObjective();
    this.timeRemaining = 60; // seconds
    this.scenarioActive = true;
    UI.setStatus("Escenario iniciado. ¡Suerte!");

    MusicManager.instance.play();
    UI.updateTime(this.timeRemaining);

    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 1;
      UI.updateTime(this.timeRemaining);
      MusicManager.instance.updateWithTimeRemaining(this.timeRemaining);

      if (ObjectiveManager.instance.isCurrentObjectiveComplete() && this.timeRemaining > 0) {
        this.winScenario();
      } else if (this.timeRemaining <= 0) {
        this.failScenario();
      }
    }, 1000);
  }

  completeObjective() {
    if (!this.scenarioActive) return;
    ObjectiveManager.instance.completeObjective();
    if (this.timeRemaining > 0) {
      this.winScenario();
    }
  }

  winScenario() {
    this.stopScenario();
    const reward = 30;
    PlayerDataManager.instance.addCurrency(reward);
    UI.setStatus(`¡Objetivo cumplido! Recompensa +${reward} monedas.`);
  }

  failScenario() {
    this.stopScenario();
    UI.setStatus("Tiempo agotado. Inténtalo de nuevo.");
  }

  stopScenario() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.scenarioActive = false;
    MusicManager.instance.stop();
  }
}

// ---------- UI Layer ----------
const UI = {
  setObjectiveText(text) { $("#objectiveText").textContent = text; },
  updateTime(seconds) { $("#timeRemaining").textContent = formatSeconds(seconds); },
  updateCurrency(amount) { $("#playerCurrency").textContent = String(amount); },
  setStatus(text) { $("#scenarioStatus").textContent = text; },

  toastQueue: [],
  toast(message) {
    const el = document.createElement("div");
    el.textContent = message;
    el.style.position = "fixed";
    el.style.right = "16px";
    el.style.bottom = `${16 + this.toastQueue.length * 42}px`;
    el.style.background = "#1c2244";
    el.style.border = "1px solid #2a2f53";
    el.style.color = "#e7ebf7";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "10px";
    el.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)";
    el.style.zIndex = 60;
    document.body.appendChild(el);
    this.toastQueue.push(el);
    setTimeout(() => {
      el.remove();
      this.toastQueue = this.toastQueue.filter((e) => e !== el);
    }, 2000);
  },

  renderStore() {
    const list = $("#storeList");
    list.innerHTML = "";
    StoreManager.instance.allItems.forEach((item) => {
      const row = document.createElement("div");
      row.className = "store-item";
      row.innerHTML = `
        <div class="meta">
          <span class="name">${item.itemName}</span>
          <span class="type">${item.itemType}</span>
        </div>
        <div>
          <span class="price">${item.price} monedas</span>
          <button data-id="${item.itemID}">Comprar</button>
        </div>`;
      row.querySelector("button").addEventListener("click", () => StoreManager.instance.buyItem(item.itemID));
      list.appendChild(row);
    });
  },

  avatarPalette: {
    avatar1: "#6aa6ff",
    avatar2: "#5dff9b",
    avatar3: "#ff7a7a",
  },
  vehiclePalette: {
    vehicle1: "linear-gradient(135deg,#ffd36a,#ff9d6a)",
    vehicle2: "linear-gradient(135deg,#6afff8,#6a83ff)",
  },

  renderAvatars() {
    const grid = $("#avatarGrid");
    grid.innerHTML = "";

    const avatars = StoreManager.instance.allItems.filter((i) => i.itemType === "Avatar");
    const player = PlayerDataManager.instance;

    avatars.forEach((a) => {
      const div = document.createElement("button");
      div.className = "select-tile" + (player.unlockedAvatars.has(a.itemID) ? "" : " locked");
      div.style.background = UI.avatarPalette[a.itemID] || "#3a3f6a";
      div.innerHTML = `<span class="badge">${a.itemID}</span>`;
      if (player.selectedAvatarID === a.itemID) div.classList.add("selected");

      div.addEventListener("click", () => {
        if (!player.unlockedAvatars.has(a.itemID)) {
          UI.toast("Compra primero este avatar en la tienda.");
          return;
        }
        player.selectAvatar(a.itemID);
        UI.highlightSelected("avatar", a.itemID);
      });

      grid.appendChild(div);
    });
  },

  renderVehicles() {
    const grid = $("#vehicleGrid");
    grid.innerHTML = "";

    const vehicles = StoreManager.instance.allItems.filter((i) => i.itemType === "Vehicle");
    const player = PlayerDataManager.instance;

    vehicles.forEach((v) => {
      const div = document.createElement("button");
      div.className = "select-tile" + (player.unlockedVehicles.has(v.itemID) ? "" : " locked");
      div.style.background = UI.vehiclePalette[v.itemID] || "#37406b";
      div.innerHTML = `<span class="badge">${v.itemID}</span>`;
      if (player.selectedVehicleID === v.itemID) div.classList.add("selected");

      div.addEventListener("click", () => {
        if (!player.unlockedVehicles.has(v.itemID)) {
          UI.toast("Compra primero este vehículo en la tienda.");
          return;
        }
        player.selectVehicle(v.itemID);
        UI.highlightSelected("vehicle", v.itemID);
      });

      grid.appendChild(div);
    });
  },

  highlightSelected(kind, id) {
    const selector = kind === "avatar" ? "#avatarGrid .select-tile" : "#vehicleGrid .select-tile";
    $$(selector).forEach((el, index) => {
      el.classList.remove("selected");
      // If badges contain the id, we match via text
      const hasId = el.querySelector(".badge")?.textContent === id;
      if (hasId) el.classList.add("selected");
    });
  },

  renderResources(resources) {
    const list = $("#resourceList");
    list.innerHTML = "";
    const all = Object.entries(resources);
    if (!all.length) {
      const li = document.createElement("li");
      li.textContent = "No hay recursos todavía.";
      list.appendChild(li);
      return;
    }
    all.forEach(([id, count]) => {
      const li = document.createElement("li");
      const pretty = id === "fuel" ? "Combustible" : id === "parts" ? "Repuestos" : id;
      li.textContent = `${pretty}: ${count}`;
      list.appendChild(li);
    });
  },

  showTutorial(text) {
    $("#tutorialText").textContent = text;
    $("#tutorialPanel").classList.remove("hidden");
  },
  hideTutorial() { $("#tutorialPanel").classList.add("hidden"); },
};

// ---------- Wire up events ----------
function bindEvents() {
  $("#startScenarioBtn").addEventListener("click", () => GameManager.instance.startNewScenario());
  $("#completeObjectiveBtn").addEventListener("click", () => GameManager.instance.completeObjective());
  $("#resetDataBtn").addEventListener("click", () => {
    PlayerDataManager.instance.resetSave();
    CustomizationManager.instance.render();
    CustomizationManager.instance.loadPlayerCustomization();
    UI.renderStore();
    UI.setObjectiveText("(sin objetivo)");
    UI.updateTime(0);
    UI.setStatus("Guardado reiniciado.");
  });

  $("#nextButton").addEventListener("click", () => TutorialManager.instance.nextStep());

  $("#playMusicBtn").addEventListener("click", () => MusicManager.instance.play());
  $("#stopMusicBtn").addEventListener("click", () => MusicManager.instance.stop());
  $("#muteToggle").addEventListener("change", (e) => MusicManager.instance.setMuted(e.target.checked));
}

// ---------- Boot ----------
function boot() {
  UI.updateCurrency(PlayerDataManager.instance.playerCurrency);
  UI.renderStore();
  UI.renderResources(PlayerDataManager.instance.resources);
  CustomizationManager.instance.render();
  CustomizationManager.instance.loadPlayerCustomization();
  bindEvents();
  TutorialManager.instance.maybeStart();
  UI.updateTime(0);
}

document.addEventListener("DOMContentLoaded", boot);