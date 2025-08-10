using UnityEngine;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using Newtonsoft.Json;

// Este script actúa como puente entre Unity y la interfaz web
public class UnityBridge : MonoBehaviour
{
    public static UnityBridge Instance { get; private set; }

    // Declarar funciones JavaScript externas
    [DllImport("__Internal")]
    private static extern void UpdatePlayerCurrency(int amount);

    [DllImport("__Internal")]
    private static extern void UpdateObjective(string objectiveText);

    [DllImport("__Internal")]
    private static extern void UpdateTimer(int seconds);

    [DllImport("__Internal")]
    private static extern void LoadStoreItems(string itemsJson);

    [DllImport("__Internal")]
    private static extern void LoadObjectives(string objectivesJson);

    [DllImport("__Internal")]
    private static extern void ShowTutorial();

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    // Métodos públicos para que otros scripts de Unity los llamen
    public void SendPlayerCurrency(int amount)
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        UpdatePlayerCurrency(amount);
        #else
        Debug.Log($"UpdatePlayerCurrency: {amount}");
        #endif
    }

    public void SendObjective(string objectiveText)
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        UpdateObjective(objectiveText);
        #else
        Debug.Log($"UpdateObjective: {objectiveText}");
        #endif
    }

    public void SendTimer(int seconds)
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        UpdateTimer(seconds);
        #else
        Debug.Log($"UpdateTimer: {seconds}");
        #endif
    }

    public void SendStoreItems(List<StoreManager.StoreItem> items)
    {
        var itemsDict = new Dictionary<string, List<object>>();
        itemsDict["avatars"] = new List<object>();
        itemsDict["vehicles"] = new List<object>();
        itemsDict["resources"] = new List<object>();

        foreach (var item in items)
        {
            var itemData = new
            {
                id = item.itemID,
                name = item.itemName,
                price = item.price,
                type = item.itemType,
                icon = GetIconForItemType(item.itemType)
            };

            switch (item.itemType)
            {
                case "Avatar":
                    itemsDict["avatars"].Add(itemData);
                    break;
                case "Vehicle":
                    itemsDict["vehicles"].Add(itemData);
                    break;
                case "Resource":
                    itemsDict["resources"].Add(itemData);
                    break;
            }
        }

        string json = JsonConvert.SerializeObject(itemsDict);
        
        #if UNITY_WEBGL && !UNITY_EDITOR
        LoadStoreItems(json);
        #else
        Debug.Log($"LoadStoreItems: {json}");
        #endif
    }

    public void SendObjectives(List<ObjectiveManager.Objective> objectives)
    {
        var objectivesList = new List<object>();
        
        foreach (var obj in objectives)
        {
            objectivesList.Add(new
            {
                id = objectives.IndexOf(obj),
                text = obj.objectiveText,
                description = GetObjectiveDescription(obj.objectiveText),
                completed = obj.isCompleted
            });
        }

        string json = JsonConvert.SerializeObject(objectivesList);
        
        #if UNITY_WEBGL && !UNITY_EDITOR
        LoadObjectives(json);
        #else
        Debug.Log($"LoadObjectives: {json}");
        #endif
    }

    public void TriggerTutorial()
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        ShowTutorial();
        #else
        Debug.Log("ShowTutorial");
        #endif
    }

    // Métodos llamados desde JavaScript
    public void RequestInitialData()
    {
        // Enviar datos iniciales a la web
        if (PlayerDataManager.Instance != null)
        {
            SendPlayerCurrency(PlayerDataManager.Instance.playerCurrency);
        }

        if (ObjectiveManager.Instance != null)
        {
            SendObjective(ObjectiveManager.Instance.GetCurrentObjectiveText());
            SendObjectives(ObjectiveManager.Instance.allPossibleObjectives);
        }

        if (GameManager.Instance != null)
        {
            SendTimer((int)GameManager.Instance.timeRemaining);
        }

        if (StoreManager.Instance != null)
        {
            SendStoreItems(StoreManager.Instance.allItems);
        }
    }

    // Integración con GameManager Update
    void Update()
    {
        // Actualizar el timer cada segundo
        if (GameManager.Instance != null && Time.frameCount % 60 == 0)
        {
            SendTimer((int)GameManager.Instance.timeRemaining);
        }
    }

    // Métodos auxiliares
    private string GetIconForItemType(string itemType)
    {
        switch (itemType)
        {
            case "Avatar":
                return "fas fa-user";
            case "Vehicle":
                return "fas fa-car";
            case "Resource":
                return "fas fa-cube";
            default:
                return "fas fa-question";
        }
    }

    private string GetObjectiveDescription(string objectiveText)
    {
        // Agregar descripciones más detalladas basadas en el texto del objetivo
        if (objectiveText.Contains("oficina"))
            return "Conduce hasta el edificio de oficinas marcado en el mapa";
        else if (objectiveText.Contains("monedas"))
            return "Encuentra y recoge las monedas doradas en el camino";
        else if (objectiveText.Contains("carrera"))
            return "Participa en una carrera contra otros jugadores";
        else
            return "Completa el objetivo indicado";
    }
}

// Archivo .jslib para WebGL (crear en Assets/Plugins/WebGL/UnityBridge.jslib)
/*
mergeInto(LibraryManager.library, {
    UpdatePlayerCurrency: function(amount) {
        if (window.UpdatePlayerCurrency) {
            window.UpdatePlayerCurrency(amount);
        }
    },
    
    UpdateObjective: function(objectiveTextPtr) {
        var objectiveText = UTF8ToString(objectiveTextPtr);
        if (window.UpdateObjective) {
            window.UpdateObjective(objectiveText);
        }
    },
    
    UpdateTimer: function(seconds) {
        if (window.UpdateTimer) {
            window.UpdateTimer(seconds);
        }
    },
    
    LoadStoreItems: function(itemsJsonPtr) {
        var itemsJson = UTF8ToString(itemsJsonPtr);
        if (window.LoadStoreItems) {
            window.LoadStoreItems(itemsJson);
        }
    },
    
    LoadObjectives: function(objectivesJsonPtr) {
        var objectivesJson = UTF8ToString(objectivesJsonPtr);
        if (window.LoadObjectives) {
            window.LoadObjectives(objectivesJson);
        }
    },
    
    ShowTutorial: function() {
        if (window.ShowTutorial) {
            window.ShowTutorial();
        }
    }
});
*/