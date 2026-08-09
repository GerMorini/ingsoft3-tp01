# Decisiones — TP1

## Conflicto de merge

Git no pudo resolver el conflicto automáticamente porque las ramas `feature/titulo-a` y `feature/titulo-b)` modificaron la misma línea de `README.md` de maneras diferentes. Git podía detectar ambas versiones, pero no podía decidir cuál representaba el resultado correcto.

El conflicto no habría aparecido si las ramas hubieran modificado archivos o líneas diferentes. También podía evitarse coordinando el cambio o creando la segunda modificación sobre una versión actualizada de `main`.

Resolví el conflicto conservando el título correspondiente a la versión B, eliminando los marcadores y verificando el resultado final en `README.md`.

## Problemas encontrados

El intento de push directo a `main` fue rechazado por la protección configurada. Esto confirmó que la regla también se aplicaba al propietario del repositorio. Para continuar, utilicé una rama y un Pull Request.

El Pull Request de la versión B quedó bloqueado porque ambas ramas habían cambiado el mismo título. Revisé las dos versiones y conservé la versión B como resultado final.

La rama `feature/titulo-b)` quedó creada con un paréntesis final accidental. El nombre no impidió completar el Pull Request, pero debería revisar los nombres antes de publicarlos en futuros trabajos.

## Uso de inteligencia artificial

Utilicé Codex para interpretar el punto 4.8, revisar el estado local del repositorio, identificar el contenido de las cuatro capturas y preparar una propuesta para `evidencias.md` y `decisiones.md`.

Verifiqué la propuesta comparándola con la consigna, las capturas, el historial local, el tag remoto y el contenido final de `README.md`. También revisé cada texto antes de incorporarlo al repositorio.