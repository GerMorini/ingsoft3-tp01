# Decisiones técnicas

## TP1

### Conflicto de merge

Git no pudo resolver el conflicto automáticamente porque las ramas `feature/titulo-a` y `feature/titulo-b)` modificaron la misma línea de `README.md` de maneras diferentes. Git podía detectar ambas versiones, pero no podía decidir cuál representaba el resultado correcto.

El conflicto no habría aparecido si las ramas hubieran modificado archivos o líneas diferentes. También podía evitarse coordinando el cambio o creando la segunda modificación sobre una versión actualizada de `main`.

Resolví el conflicto conservando el título correspondiente a la versión B, eliminando los marcadores y verificando el resultado final en `README.md`.

### Problemas encontrados

El intento de push directo a `main` fue rechazado por la protección configurada. Esto confirmó que la regla también se aplicaba al propietario del repositorio. Para continuar, utilicé una rama y un Pull Request.

El Pull Request de la versión B quedó bloqueado porque ambas ramas habían cambiado el mismo título. Revisé las dos versiones y conservé la versión B como resultado final.

La rama `feature/titulo-b)` quedó creada con un paréntesis final accidental. El nombre no impidió completar el Pull Request, pero debería revisar los nombres antes de publicarlos en futuros trabajos.

### Uso de inteligencia artificial

Utilicé Codex para interpretar el punto 4.8, revisar el estado local del repositorio, identificar el contenido de las cuatro capturas y preparar una propuesta para `evidencias.md` y `decisiones.md`.

Verifiqué la propuesta comparándola con la consigna, las capturas, el historial local, el tag remoto y el contenido final de `README.md`. También revisé cada texto antes de incorporarlo al repositorio.

## TP2 — Contenedores

### Aplicación elegida

Elegí **FitPro**, una aplicación web académica para gestionar ejercicios, sesiones y rutinas de
entrenamiento. Incluye registro e inicio de sesión, un backend HTTP, una SPA y persistencia
relacional.

La aplicación cumple los criterios propuestos por la cátedra:

- **Construcción y ejecución local:** backend y frontend poseen comandos de compilación definidos y
  el sistema completo puede iniciarse con Docker Compose.
- **Posibilidad de testing:** existen pruebas automatizadas para reglas y comportamiento del backend
  Go y para componentes del frontend React.
- **Comprensión y modificación:** el backend es un monolito modular con una organización explícita
  por capas. El frontend utiliza componentes React y estado local, sin una arquitectura distribuida.
- **Tamaño acotado:** el alcance se concentra en autenticación y en el CRUD de ejercicios, sesiones
  y rutinas. Esto ofrece comportamiento suficiente para los próximos trabajos prácticos sin agregar
  complejidad innecesaria.

El proyecto es propio e individual. Lo utilizaré como base para los siguientes trabajos prácticos y
para el integrador.

### Contenerización del backend

El backend usa un Dockerfile multi-stage:

1. La etapa de construcción parte de `golang:1.26.5-alpine`.
2. Primero copia `go.mod` y `go.sum` y ejecuta `go mod download`. Esto permite reutilizar la caché de
   dependencias cuando solo cambia el código fuente.
3. Después copia el código y genera un binario Linux estático con `CGO_ENABLED=0`.
4. La etapa final parte de `scratch` y contiene únicamente el binario `/api`.

Elegí `scratch` porque el backend no necesita shell, compilador ni herramientas del sistema durante
la ejecución. Esto reduce el tamaño y la superficie de ataque. El proceso se ejecuta con el usuario
no privilegiado `65532:65532`, expone el puerto interno `8080` y usa `/api` como `ENTRYPOINT`.

Las migraciones SQL se incluyen dentro del binario y se aplican antes de iniciar el servidor HTTP.
Se ejecutan ordenadas, dentro de una transacción, y se registran en `schema_migrations`. Así no hace
falta levantar un contenedor exclusivo para migraciones y un error de esquema impide iniciar un
backend inconsistente.

### Contenerización del frontend

El frontend también usa un Dockerfile multi-stage:

1. La etapa de construcción parte de `node:26.7-alpine`.
2. Copia primero `package.json` y `package-lock.json` y ejecuta `npm ci` para obtener una instalación
   reproducible y aprovechar la caché.
3. Compila TypeScript y React con Vite.
4. La etapa final parte de `nginx:1.28-alpine` y recibe solamente los archivos estáticos de `dist`.

Node y las dependencias de desarrollo no viajan en la imagen final. Nginx sirve la SPA y resuelve
rutas del frontend mediante `try_files ... /index.html`.

La SPA consume rutas relativas `/api`. Nginx las reenvía a `http://backend:8080`, donde `backend` es
el nombre DNS del servicio dentro de la red de Compose. Elegí este enfoque porque evita fijar una URL
del backend dentro del bundle y mantiene frontend y API bajo el mismo origen, sin agregar CORS.

Cada contexto de construcción tiene su propio `.dockerignore`. Se excluyen archivos de Git,
dependencias locales, builds previos, logs, coberturas y archivos de entorno.

### Orquestación con Docker Compose

`docker-compose.yml` declara tres servicios:

- `db`: PostgreSQL 18.4 Alpine.
- `backend`: API Go construida desde `backend/Dockerfile`.
- `frontend`: SPA construida desde `frontend/Dockerfile` y servida por Nginx.

El backend se conecta a PostgreSQL usando `db:5432`. No usa `localhost`, porque dentro de un
contenedor `localhost` identifica al propio contenedor. Compose proporciona resolución DNS mediante
el nombre del servicio.

`depends_on` espera que el healthcheck de PostgreSQL informe que la base acepta conexiones. Esto es
necesario porque el orden de creación de contenedores no garantiza que la base ya esté preparada.

El backend solo usa `expose`, por lo que queda disponible dentro de la red de Compose. El único punto
de entrada de la aplicación es el frontend, publicado en `127.0.0.1:3000` por defecto. Nginx realiza
el proxy interno hacia la API.

### Persistencia y configuración

El volumen nombrado `postgres_data` conserva el contenido de PostgreSQL fuera de la capa efímera del
contenedor. Por eso `docker compose down` elimina contenedores y red, pero mantiene usuarios,
ejercicios, sesiones y rutinas. `docker compose down -v` elimina también el volumen y reinicia la
base desde cero en el siguiente arranque.

Backend y frontend son descartables. No guardan estado persistente dentro de sus contenedores.

Credenciales y secreto JWT entran mediante variables de entorno. El archivo `.env` real está
ignorado por Git y `.env.example` conserva solamente nombres y valores no secretos necesarios para
configurar una instalación nueva.

### Registry y arquitectura

Las imágenes publicadas son:

- `ghcr.io/germorini/backend:v1.0.0`
- `ghcr.io/germorini/frontend:v1.0.0`

El tag `v1.0.0` sigue versionado semántico. `docker-compose.registry.yml` mantiene la misma base,
red, volumen, healthcheck y configuración, pero usa esas imágenes mediante `image:` en lugar de
construirlas desde el código.

Las imágenes se construyeron en una máquina Linux `amd64`/`x86_64`. En este TP se publica esa única
arquitectura. Una publicación multi-arquitectura se podrá resolver posteriormente con
`docker buildx`.

### Problemas encontrados

#### Comunicación entre SPA y backend

Una SPA ejecuta sus solicitudes dentro del navegador. El nombre `backend` pertenece a la red interna
de Compose y no puede resolverse directamente desde el navegador. Se resolvió usando rutas relativas
`/api` y configurando Nginx como proxy inverso hacia `backend:8080`.

#### Disponibilidad de PostgreSQL

Iniciar primero el contenedor de la base no asegura que PostgreSQL ya acepte conexiones. Se agregó
un healthcheck con `pg_isready`, y el backend depende de su estado saludable.

#### Migraciones sin contenedor adicional

Inicialmente las migraciones se ejecutaban mediante un servicio temporal. Se reemplazó por un
ejecutor embebido en el backend. El backend abre la conexión, bloquea ejecuciones concurrentes,
aplica solamente migraciones pendientes y después inicia HTTP.

#### Persistencia durante recreaciones

Se comprobó que recrear contenedores sin `-v` conserva los ejercicios existentes. También se
comprobó que `down -v` elimina el volumen: las credenciales anteriores dejan de existir después del
nuevo arranque.

### Uso de inteligencia artificial

Utilicé inteligencia artificial para crear e iterar el código de la aplicación y para asistir la
redacción de `decisiones.md` y `evidencias.md`.

Revisé el resultado mediante la compilación, las pruebas automatizadas disponibles, la ejecución
completa con Docker Compose y las pruebas manuales documentadas en las capturas. Los commits, ramas,
tags, comandos de Docker, publicación de imágenes y capturas fueron realizados manualmente por mí.
También revisé los archivos generados y puedo explicar las decisiones técnicas usadas.

## TP3 — Planificación y trazabilidad

### Duración del sprint

Se definió una duración de **1 semana** para el sprint.

La elección se realizó para alinear las iteraciones con la frecuencia semanal de las clases y con el ritmo esperado de avance y entrega de los trabajos prácticos de la materia. De esta forma, cada sprint representa aproximadamente un ciclo de trabajo entre una clase y la siguiente.

Además, esta duración permite revisar el progreso con frecuencia y ajustar la planificación en función de las consignas o avances de cada semana.

### Límite de trabajo en progreso

Se configuró un límite de trabajo en progreso (**WIP**) de **3 elementos** en la columna `In Progress`.

Al trabajar individualmente, este valor permite mantener más de una tarea activa cuando alguna queda bloqueada o pendiente de revisión, sin dejar el tablero completamente abierto a una cantidad excesiva de trabajo simultáneo. Se eligió como un límite moderado que permite cierta flexibilidad durante la práctica con la herramienta.

Aunque un WIP menor podría reducir todavía más el cambio de contexto, se consideró que un límite de 3 era adecuado para este TP por su carácter introductorio y práctico.

### Diagnóstico de la historia mal escrita

La historia:

> Como desarrollador quiero crear la tabla usuarios para guardar los datos.

está mal planteada como historia de usuario porque describe una **tarea técnica de implementación** y no una capacidad o valor observable para un usuario.

Una forma más apropiada de expresarla sería:

> Como usuario quiero registrarme en la aplicación para poder acceder a sus funcionalidades con mi propia cuenta.

La creación de la tabla de usuarios podría formar parte de las tareas técnicas necesarias para implementar esa historia.

### Problemas encontrados y soluciones

La principal dificultad encontrada fue familiarizarme con la interfaz web de **GitHub Projects** y comprender cómo se representan en la herramienta los conceptos estudiados, como épicas, historias de usuario, tareas, sub-issues, iteraciones, estados y límites de trabajo en progreso.

También tuve dificultades inicialmente para relacionar los conceptos teóricos con su implementación concreta dentro de GitHub Projects. Para comprender mejor el funcionamiento de la herramienta, realicé la mayor parte de la configuración manualmente desde la interfaz web, revisando cada opción y verificando cómo afectaba al proyecto.

Este procedimiento tomó más tiempo, pero me permitió entender mejor la relación entre los issues, la jerarquía de trabajo, el sprint y el tablero, en lugar de automatizar toda la configuración sin comprender qué estaba realizando.

### Uso de inteligencia artificial

Se utilizó **ChatGPT** como herramienta de apoyo durante la realización del TP.

La asistencia se utilizó principalmente para:

- aclarar conceptos relacionados con GitHub Projects y la planificación ágil;
- interpretar algunos requisitos de la consigna;
- obtener ejemplos de comandos de `gh` para crear issues y realizar determinadas configuraciones desde la terminal;
- resolver dudas sobre la relación entre épicas, historias de usuario, tareas, bugs, sprints y límites WIP.

Las configuraciones del Project y la mayor parte de las operaciones se realizaron manualmente desde la interfaz web de GitHub para comprender el funcionamiento de la herramienta.

Los comandos proporcionados por la IA fueron ejecutados y verificados observando posteriormente su resultado tanto en GitHub como en la terminal. También se contrastaron las explicaciones con la consigna del TP antes de aplicarlas.

## TP4 — Integración continua

### Estructura del pipeline

El workflow utiliza dos jobs independientes: `build-backend` y `build-frontend`. Cada job construye
una de las imágenes definidas en el TP2 y se ejecuta en su propio runner. No se declaró una
dependencia entre ellos porque ninguno necesita archivos ni resultados producidos por el otro. Esto
permite que GitHub Actions los ejecute en paralelo.

El pipeline construye las imágenes mediante `backend/Dockerfile` y `frontend/Dockerfile`. No repite
la compilación con comandos propios de Go o Node. Así existe una sola definición del proceso de
build y se evita verificar algo distinto de lo que posteriormente se ejecutará o desplegará.

En este TP las imágenes no se publican ni se conservan. Su construcción sirve para producir los
checks que verifican cada Pull Request. Los tests y sus reportes se incorporarán en el TP5.

### Cache de capas

Cada job usa el cache de GitHub Actions mediante Buildx. Los scopes `backend` y `frontend` están
separados para impedir que una imagen sobrescriba el cache de la otra.

En el backend se puede reutilizar la descarga de módulos mientras no cambien `go.mod` ni `go.sum`.
Los cambios en el código invalidan las capas creadas desde `COPY . .` y obligan a recompilar el
binario. En el frontend, `npm ci` se reutiliza mientras no cambien `package.json` ni
`package-lock.json`; los cambios dentro de `src` invalidan el copiado y la compilación posterior.

La segunda corrida del mismo Pull Request importó los dos caches independientes. El log mostró ocho
capas `CACHED` en el frontend y seis en el backend. El cache es solamente una optimización: si
desaparece, las imágenes deben poder construirse nuevamente desde cero.

### Pipeline como gate

La protección de `main` exige que `build-backend` y `build-frontend` terminen correctamente. También
usa el modo estricto, por lo que un Pull Request debe verificarse contra la versión más reciente de
`main` antes de poder fusionarse. Las aprobaciones permanecen en cero porque el proyecto es
individual y GitHub no permite aprobar un Pull Request propio.

### Problemas encontrados y soluciones

Para comprobar el gate se introdujo de forma temporal una referencia a un símbolo inexistente en el
backend. El job `build-backend` falló durante la instrucción `go build` del Dockerfile con el error
`undefined: simboloInexistente`, mientras que `build-frontend` terminó correctamente. GitHub marcó
el Pull Request como bloqueado porque uno de sus checks obligatorios estaba en rojo.

La referencia inválida se eliminó en un segundo commit del mismo Pull Request. De esta manera, el
historial conserva tanto la corrida fallida como la corrección que vuelve a habilitar el merge.

### Uso de inteligencia artificial

Utilicé Codex para interpretar la consigna, adaptar el workflow a los Dockerfiles del proyecto,
preparar comandos y asistir la redacción de esta sección. Las operaciones de Git y la configuración
de protección de rama fueron realizadas manualmente.

Verifiqué la asistencia revisando cada cambio, construyendo las imágenes con Docker y consultando
los jobs y logs reales de GitHub Actions. También confirmé que los checks obligatorios y el cache
se comportaran como exige la consigna.
