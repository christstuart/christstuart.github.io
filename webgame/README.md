# Mini Juego Web

Pequeña interfaz web que replica los sistemas del ejemplo de Unity: objetivos dinámicos, tienda, personalización, música que reacciona al tiempo y tutorial.

## Ejecutar

1. Inicia un servidor estático, por ejemplo con Python 3:

```bash
cd /workspace/webgame
python3 -m http.server 8000
```

2. Abre en el navegador `http://localhost:8000`.

## Qué incluye
- Objetivo aleatorio y botón para completarlo
- Cuenta atrás con umbral de tensión (la música acelera)
- Tienda con avatares, vehículos y recursos (monedas simuladas)
- Selección de avatar/vehículo (solo si están desbloqueados)
- Guardado en `localStorage`
- Tutorial para primeras ejecuciones