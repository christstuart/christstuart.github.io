# Unity Racing Game - Web Interface

Este proyecto proporciona una interfaz web moderna y completa para tu juego de Unity con funcionalidades avanzadas como sistema de misiones, tienda, personalización, música dinámica y tutoriales.

## 🎮 Características

- **Interfaz de Usuario Moderna**: Diseño futurista con animaciones fluidas y efectos visuales atractivos
- **Sistema de Tienda**: Compra avatares, vehículos y recursos con la moneda del juego
- **Personalización**: Selecciona y personaliza tu avatar y vehículo
- **Gestión de Objetivos**: Sistema dinámico de misiones con seguimiento en tiempo real
- **Configuración de Audio/Video**: Ajustes de volumen de música, efectos de sonido y calidad gráfica
- **Tutorial Interactivo**: Guía paso a paso para nuevos jugadores
- **Diseño Responsivo**: Funciona perfectamente en escritorio y dispositivos móviles
- **Integración con Unity WebGL**: Comunicación bidireccional completa entre Unity y la web

## 📁 Estructura del Proyecto

```
/workspace/
├── index.html           # Estructura principal de la interfaz web
├── styles.css          # Estilos CSS con diseño moderno y animaciones
├── game-interface.js   # Lógica de JavaScript para la interfaz y comunicación con Unity
├── UnityLoader.js      # Loader de Unity (reemplazar con el real de tu build)
├── UnityBridge.cs      # Script de Unity para comunicación con la web
└── README.md          # Este archivo
```

## 🚀 Configuración e Instalación

### 1. Preparar Unity para WebGL

1. **Agregar el script UnityBridge.cs a tu proyecto de Unity:**
   - Copia `UnityBridge.cs` a tu carpeta de Scripts en Unity
   - Crea un GameObject vacío en tu escena principal
   - Añade el componente `UnityBridge` a ese GameObject

2. **Crear el archivo de JavaScript para Unity:**
   - En Unity, crea la carpeta `Assets/Plugins/WebGL/` si no existe
   - Crea un archivo llamado `UnityBridge.jslib`
   - Copia el contenido del comentario al final de `UnityBridge.cs` en este archivo

3. **Modificar tus scripts existentes de Unity:**
   - En tu `GameManager`, después de actualizar el tiempo, llama a:
     ```csharp
     UnityBridge.Instance.SendTimer((int)timeRemaining);
     ```
   - En tu `PlayerDataManager`, cuando cambies la moneda:
     ```csharp
     UnityBridge.Instance.SendPlayerCurrency(playerCurrency);
     ```
   - En tu `ObjectiveManager`, cuando cambies el objetivo:
     ```csharp
     UnityBridge.Instance.SendObjective(currentObjective.objectiveText);
     ```

### 2. Construir para WebGL

1. En Unity, ve a `File > Build Settings`
2. Selecciona `WebGL` como plataforma
3. Configura las opciones de build:
   - Player Settings > Publishing Settings > Compression Format: `Disabled` (para pruebas)
   - Player Settings > Resolution and Presentation > Default Canvas Width: `960`
   - Player Settings > Resolution and Presentation > Default Canvas Height: `600`
4. Haz clic en `Build` y selecciona una carpeta de salida

### 3. Integrar con la Interfaz Web

1. De tu build de Unity WebGL, copia estos archivos a la carpeta del proyecto web:
   - `Build/` (carpeta completa)
   - `TemplateData/` (si existe)
   - `UnityLoader.js` (reemplaza el archivo stub)

2. Actualiza `game-interface.js` con las rutas correctas:
   ```javascript
   const unityConfig = {
       dataUrl: "Build/TuJuego.data",
       frameworkUrl: "Build/TuJuego.framework.js",
       codeUrl: "Build/TuJuego.wasm",
       // ... resto de la configuración
   };
   ```

### 4. Servir la Aplicación

Para ejecutar la aplicación web, necesitas un servidor web local (WebGL no funciona con `file://`):

**Opción 1 - Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Opción 2 - Node.js:**
```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
http-server -p 8000
```

**Opción 3 - VS Code:**
- Instala la extensión "Live Server"
- Click derecho en `index.html` > "Open with Live Server"

## 🎯 Uso de la Interfaz

### Controles Principales

- **Tienda** (`Ctrl/Cmd + S`): Abre el menú de la tienda
- **Personalización** (`Ctrl/Cmd + C`): Abre opciones de personalización
- **Objetivos** (`Ctrl/Cmd + O`): Ver misiones y objetivos
- **Ajustes** (`Ctrl/Cmd + ,`): Configuración de audio/video
- **ESC**: Cerrar cualquier modal abierto

### Funcionalidades

1. **HUD Principal:**
   - Muestra moneda actual del jugador
   - Objetivo actual activo
   - Temporizador de cuenta regresiva

2. **Sistema de Tienda:**
   - Tres categorías: Avatares, Vehículos, Recursos
   - Validación de moneda antes de comprar
   - Animaciones de compra exitosa

3. **Personalización:**
   - Selección visual de avatar y vehículo
   - Los cambios se sincronizan con Unity inmediatamente

4. **Tutorial:**
   - Se muestra automáticamente para nuevos jugadores
   - 5 pasos explicando las funcionalidades principales

## 🔧 Personalización

### Cambiar Colores del Tema

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #00d4ff;      /* Color principal */
    --secondary-color: #ff6b35;     /* Color secundario */
    --accent-color: #ffd700;        /* Color de acento (monedas) */
    --dark-bg: #0a0a0a;            /* Fondo oscuro */
    --light-bg: #1a1a1a;           /* Fondo claro */
}
```

### Agregar Nuevos Items a la Tienda

En `game-interface.js`, modifica la función `generateDemoItems()`:

```javascript
avatars: [
    { id: 'avatar4', name: 'Mi Nuevo Avatar', price: 750, icon: 'fas fa-user-secret', type: 'Avatar' },
    // ... más items
]
```

### Modificar Pasos del Tutorial

En `game-interface.js`, edita el array `tutorialSteps` en la función `showTutorial()`.

## 📱 Soporte Móvil

La interfaz incluye diseño responsivo completo:
- Los paneles se reorganizan en pantallas pequeñas
- Los botones se adaptan al tamaño del dispositivo
- Los modales ocupan más espacio en móviles
- Touch-friendly para todos los controles

## 🐛 Solución de Problemas

### La interfaz no carga
- Asegúrate de estar usando un servidor web, no `file://`
- Verifica la consola del navegador para errores
- Confirma que todos los archivos están en las rutas correctas

### Unity no se comunica con la web
- Verifica que `UnityBridge.cs` esté en la escena
- Asegúrate de que el archivo `.jslib` esté en la carpeta correcta
- Comprueba que estés construyendo para WebGL

### Los datos no se actualizan
- Revisa que estés llamando los métodos de `UnityBridge.Instance`
- Verifica la consola para mensajes de debug
- Asegúrate de que los nombres de objetos en `SendMessage` coincidan

## 🤝 Integración con Scripts de Unity Existentes

Para integrar completamente con tus scripts existentes:

1. **En ObjectiveManager.cs:**
   ```csharp
   public void CompleteObjective()
   {
       currentObjective.isCompleted = true;
       objectiveUI.text = "¡Objetivo completado!";
       
       // Agregar esta línea
       UnityBridge.Instance.SendObjective("¡Objetivo completado!");
   }
   ```

2. **En StoreManager.cs:**
   ```csharp
   public void BuyItem(string itemID)
   {
       // ... lógica de compra existente ...
       
       // Actualizar la UI web
       UnityBridge.Instance.SendPlayerCurrency(PlayerDataManager.Instance.playerCurrency);
   }
   ```

3. **En MusicManager.cs:**
   ```csharp
   // Agregar método para recibir cambios de volumen desde la web
   public void SetVolume(float volume)
   {
       musicSource.volume = volume;
   }
   ```

## 📄 Licencia

Este proyecto está diseñado para integrarse con tu juego de Unity existente. Siéntete libre de modificar y adaptar el código según tus necesidades.

---

¡Disfruta creando tu juego! Si tienes preguntas o necesitas ayuda adicional, no dudes en consultar la documentación de Unity WebGL o contactar con la comunidad.