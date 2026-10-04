# Decisiones técnicas

## Enlaces del TP7

### Imágenes y entornos

- [Backend en GHCR](https://github.com/GerMorini/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend),
  con la imagen verificada `sha-ebc822ee8b165ba26c1717f7dae484faee5d08af`.
- [Frontend en GHCR](https://github.com/GerMorini/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend),
  con la imagen verificada `sha-ebc822ee8b165ba26c1717f7dae484faee5d08af`.
- QA: [frontend](https://fitpro-germorini-front-qa.onrender.com) y
  [API](https://fitpro-germorini-api-qa.onrender.com/health).
- PROD: [frontend](https://fitpro-germorini-front-prod.onrender.com) y
  [API](https://fitpro-germorini-api-prod.onrender.com/health).

### Gate de integración y E2E

El commit que rompió el alta desde el frontend fue
`a2ccfb8f8d4ad6867f2355bf33ba7763a35e32b5`. La
[corrida roja](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/37242973773) conservó verdes
el smoke y la integración, dejó E2E en rojo y omitió PROD. Publicó por separado el
[reporte de integración](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/37242973773/artifacts/11318166158)
y el [reporte E2E](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/37242973773/artifacts/11318186320).

La [corrida corregida](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/37243527435)
ejecutó la cadena completa hasta PROD con la imagen
`sha-ebc822ee8b165ba26c1717f7dae484faee5d08af`: tres pruebas de integración y tres E2E verdes,
aprobación humana y smoke productivo.

## Enlaces del TP6

### Paquetes públicos

- [Backend en GHCR](https://github.com/GerMorini/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend),
  publicado como `ghcr.io/germorini/ingsoft3-tp01-backend`.
- [Frontend en GHCR](https://github.com/GerMorini/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend),
  publicado como `ghcr.io/germorini/ingsoft3-tp01-frontend`.

Ambos paquetes son públicos, admiten `docker pull` sin credenciales y poseen tags inmutables con el
formato `sha-<commit>`. La primera publicación comprobada corresponde al merge
`1ead1422b16dd4fc6993bed2ef0a2bf19072a739`.

### Cadena de publicación

- [Job de un Pull Request](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/37160475916/job/111312692992):
  los tests quedan verdes, pero el login a GHCR aparece salteado y no se publica la imagen.
- [Job de `main`](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/37160680084/job/111313288747):
  después de tests, coverage y artefacto, `Construir y publicar backend` es el último paso propio.

### Entornos desplegados

- QA: [frontend](https://fitpro-germorini-front-qa.onrender.com) y
  [API](https://fitpro-germorini-api-qa.onrender.com/health).
- PROD: [frontend](https://fitpro-germorini-front-prod.onrender.com) y
  [API](https://fitpro-germorini-api-prod.onrender.com/health).

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

## TP5 — Calidad automatizada

### Lógica elegida

Prioricé reglas cuyo fallo afecta seguridad, integridad de datos o uso normal de la aplicación:
registro y contraseñas, emisión y validación de JWT, validación de ejercicios, sesiones y rutinas,
estado de la sesión en el navegador, conversión segura de enlaces de YouTube y contrato del login
con la API. Son reglas con entradas inválidas y bordes concretos; por eso un cambio incorrecto puede
ser detectado por un assert y no solamente ejecutado para aumentar cobertura.

En el backend cuento métodos `Test...`, no los subtests creados con `t.Run`. La selección evaluable
contiene once métodos y supera el mínimo de ocho:

| Método | Regla principal | Técnica destacada |
|---|---|---|
| `TestNormalizeAndValidateRegistration` | Normalización de identidad y domicilio | Parametrizado |
| `TestNormalizeAndValidateRegistration_InvalidFields` | Formatos y campos obligatorios | Parametrizado y error |
| `TestNormalizeAndValidateRegistration_PasswordThresholds` | Bordes de contraseña y domicilio | Bordes exactos |
| `TestHashAndVerifyPassword` | Hash Argon2id y verificación | Seguridad |
| `TestTokenManager_Issue` | Claims y duración del JWT | Tiempo controlado |
| `TestTokenManager_Validate` | Expiración, firma y algoritmo del JWT | Parametrizado y error |
| `TestService_RegisterCallsRepositoryWithNormalizedSecureData` | Coordinación del registro | Mock |
| `TestService_RegisterDoesNotCallRepositoryForInvalidInput` | Rechazo antes de persistir | Error y mock |
| `TestValidateExercise` | Nombre, opcionales y URL del ejercicio | Parametrizado y error |
| `TestValidateSession` | Cantidades, orden y duplicados | Parametrizado y error |
| `TestValidateRoutine` | Días válidos y sesiones duplicadas | Parametrizado y error |

Esto cubre más de cuatro reglas independientes. En particular, una prueba de mutación manual cambió
temporalmente el límite de día de `> 7` a `>= 7`. El caso `weekday boundaries` se puso rojo al
rechazar el día 7. Luego restauré la condición y el test volvió a verde. La mutación no forma parte
del código entregado; confirma que el assert protege el borde real.

En el frontend hay doce métodos unitarios directos. Cada archivo declara
`// @vitest-environment node`, por lo que estos tests no dependen del DOM:

| Método | Comportamiento | Técnica destacada |
|---|---|---|
| `youtubeEmbedURL` convierte variantes oficiales | Produce URL `youtube-nocookie` | `it.each` |
| `youtubeEmbedURL` rechaza entradas inseguras | Rechaza protocolo, host o ID inválido | `it.each` y error |
| `isAccessTokenExpired` evalúa el vencimiento | Antes, durante y después del borde | `it.each` |
| `isAccessTokenExpired` rechaza token malformado | La ausencia de payload vence la sesión | Error |
| `isAccessTokenExpired` rechaza token sin `exp` | La ausencia de vencimiento invalida la sesión | Error |
| `login` usa el cliente inyectado | Envía una sola solicitud con contrato exacto | Mock `vi.fn()` |
| `login` transforma un rechazo HTTP | Expone `ApiError` con estado y cuerpo | Mock y error |
| `describeSessionLoad` recibe una sesión vacía | Informa ausencia de ejercicios | Borde vacío |
| `describeSessionLoad` recibe carga ausente | Informa que falta configuración | Error funcional |
| `describeSessionLoad` rechaza cantidades inválidas | Rechaza negativos y decimales | `it.each` y error |
| `describeSessionLoad` recibe carga parcial | Detecta ejercicios incompletos | Camino alternativo |
| `describeSessionLoad` clasifica carga | Verifica bordes 30/31 y 60/61 | `it.each` y bordes |

### Estructura AAA

`TestService_RegisterCallsRepositoryWithNormalizedSecureData` muestra Arrange, Act y Assert. En
Arrange crea el doble del repositorio y el servicio; en Act ejecuta `Register`; en Assert comprueba
resultado, cantidad de llamadas, normalización y que el repositorio reciba un hash Argon2id en vez
de la contraseña. Los bloques están separados por líneas en blanco. Los tests parametrizados
preparan la tabla antes del bucle, ejecutan una acción dentro de cada `t.Run` o `it.each` y verifican
el resultado correspondiente.

### Dobles e inyección de dependencias

El servicio de identidad dependía del tipo concreto del repositorio. Lo cambié para recibir una
interfaz privada con solamente `CreateUser` y `FindCredentialsByUsername`. El repositorio real la
satisface sin adaptadores. El doble manual registra llamadas y permite configurar respuestas. Es
un mock cuando el test verifica cantidad y parámetros; su respuesta configurada también cumple el
papel de stub.

En el frontend, `login` usaba directamente `fetch`. Ahora acepta un segundo parámetro opcional cuyo
valor predeterminado sigue siendo `fetch`, por lo que los consumidores no cambian. El test inyecta
un `vi.fn()`: funciona como stub al devolver una `Response` y como mock cuando se verifican ruta,
método, cabeceras, cuerpo y cantidad de llamadas. Un fake, a diferencia de ambos, sería una
implementación funcional simplificada, por ejemplo un repositorio completo en memoria.

### Herramientas del stack

| Necesidad | Backend Go | Frontend TypeScript |
|---|---|---|
| Parametrización | Tabla, `t.Run` | `it.each` de Vitest |
| Doble | Estructura manual que implementa interfaz | `vi.fn()` |
| Medición | `go test -coverprofile` y `go tool cover` | `@vitest/coverage-v8` 4.1.10 |
| Umbral | Script shell y comparación con `awk` | `thresholds` de Vitest |
| Selección medida | Lista explícita de paquetes | `include` y `exclude` de V8 |

Vitest y `@vitest/coverage-v8` usan exactamente la versión 4.1.10. Los targets `test` de ambos
Dockerfiles heredan la etapa de compilación. Así el pipeline construye la misma receta que produce
la imagen final y luego ejecuta tests y cobertura con las herramientas ya incluidas en esa etapa.

### Cobertura y umbrales

La medición dentro del target Docker dio 31,2 % de statements en backend. El umbral es 25 % de statements.
Para no elegir un valor arbitrario apliqué `5 × floor((cobertura - 3) / 5)`: queda cerca de la
medición real, conserva 6,2 puntos de margen y frena una caída relevante. Go no ofrece branch
coverage mediante `go test`; el summary lo declara como no disponible en lugar de presentar un
dato inventado.

En frontend obtuve 80 % de líneas y 85,71 % de ramas. Los umbrales son 75 % para líneas y 80 %
para ramas, calculados con la misma fórmula y con márgenes de 5 y 5,71 puntos. Uso ambas métricas
como gate. Ramas aporta más información porque distingue los dos caminos de una condición aunque
la línea que contiene esa condición ya se haya ejecutado.

Subir diez puntos exigiría pruebas de controllers y caminos de error actualmente no recorridos en
backend. En frontend exigiría cubrir más funciones TypeScript y decisiones restantes, especialmente
casos alternativos del parser de YouTube y módulos de API. No corresponde elevar primero el número:
el nuevo umbral debe acompañar tests con asserts significativos.

En backend entran `identity/controller`, `identity/service`, `platform/config`,
`routines/controller` y `routines/service`. Excluí `cmd/api`, porque solamente compone y arranca la
aplicación; DAO, DTO y tipos, porque transportan datos; migraciones, porque son DDL e infraestructura;
database, porque abre la conexión real; y repositories, porque su comportamiento depende de
PostgreSQL y ya se prueba con tests de integración. Los tests con tag `integration` también quedan
fuera de la ejecución unitaria porque requieren una base real.

En frontend entran los archivos `src/**/*.ts`. Excluí declaraciones `.d.ts`, archivos `types.ts` y
`src/test`, porque no contienen reglas productivas. También excluí `.tsx`: el alcance de este gate
es la lógica TypeScript sin DOM; los componentes mantienen sus pruebas separadas, pero no se mezclan
en esta medición. La configuración falla si el patrón termina midiendo cero archivos.

Cobertura alta no garantiza corrección. Un ejemplo de esta aplicación sería llamar
`youtubeEmbedURL(url)` sin ningún `expect`: V8 marcaría sus líneas como ejecutadas aunque el test no
compruebe la URL producida ni el rechazo de un dominio falso. Coverage detecta código no recorrido;
los asserts determinan si el resultado fue realmente verificado.

### Ejercicio de rama sin cubrir

El primer reporte marcó una rama parcial en `frontend/src/routines/components/youtube.ts`, línea 24:
`url.searchParams.get("v") ?? undefined`. La entrada concreta que recorre el lado nulo es
`https://youtube.com/watch`, una URL de reproducción sin parámetro `v`. Decidí agregarla al caso
parametrizado de rechazo porque una URL sin identificador no puede producir un embed válido. Tras
repetir la medición, la cobertura de ramas total subió de 78,84 % a 80,76 % y la del archivo pasó
de 88 % a 92 %.

### Pipeline y reportes

El workflow conserva los checks `build-backend` y `build-frontend`. Cada job construye la imagen
final y el target `test` con scopes de cache separados. Después ejecuta el contenedor de tests con
una carpeta montada, agrega las métricas a `$GITHUB_STEP_SUMMARY` y publica respectivamente los
artefactos `coverage-backend` y `coverage-frontend`. Los pasos de publicación usan `!cancelled()`
para conservar los reportes aunque falle un test o un umbral.

La primera ejecución completa terminó con ambos checks verdes y publicó los dos resúmenes y
artefactos: [corrida 36154341919](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/36154341919).
La implementación y la secuencia completa se realizaron en el
[Pull Request 17](https://github.com/GerMorini/ingsoft3-tp01/pull/17), posteriormente fusionado.

Para comprobar el gate backend deshabilité temporalmente tres métodos de prueba, sin cambiar código
productivo. Los tests restantes y la compilación terminaron correctamente, pero statements bajó a
21,9 %, debajo del umbral de 25 %. Por eso `build-backend` quedó rojo mientras `build-frontend`
permaneció verde: [corrida roja 36156384353](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/36156384353).
Después restauré los tres métodos en el siguiente commit. El historial del Pull Request conserva la
demostración sin dejar pruebas deshabilitadas en el resultado final. La
[corrida 36156745365](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/36156745365)
confirmó nuevamente ambos checks verdes.

La demostración frontend agregó `describeSessionLoad` y la usó en el detalle de sesión sin agregar
sus tests. La aplicación compiló y los 49 tests existentes quedaron verdes, pero lines bajó a
68,18 % y branches a 60 %. Ambos valores quedaron bajo sus umbrales y `build-frontend` bloqueó el
Pull Request: [corrida roja 36157720498](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/36157720498).
La corrección agrega entradas para sesión vacía, carga ausente, cantidades inválidas, configuración
parcial y los bordes 30/31 y 60/61 de carga baja, media y alta. Con esos tests, lines llegó a 80 %
y branches a 85,71 %; ambos checks volvieron a verde en la
[corrida 36158181986](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/36158181986).

El primer Pull Request cuenta la historia completa: rojo por backend, restauración, rojo por
frontend, tests nuevos, verde y merge. Para dejar evidencia vigente del bloqueo, el
[Pull Request 18](https://github.com/GerMorini/ingsoft3-tp01/pull/18) agrega
`routineScheduleSummary` sin tests y permanece abierto. La aplicación compila y los 60 tests
existentes pasan, pero lines queda en 74,57 % frente al umbral de 75 %, y branches en 76,92 % frente
al umbral de 80 %. Por eso `build-frontend` permanece rojo únicamente por coverage en la
[corrida 36159591922](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/36159591922), mientras
`build-backend` permanece verde. Este segundo PR no se corrige ni se fusiona antes de la defensa.

### Smoke test final

Antes de fusionar el primer Pull Request ejecuté manualmente la aplicación completa. Verifiqué
login, navegación, listado de sesiones, detalle de una sesión vacía con `Sin ejercicios`, detalle
de una sesión configurada con su nivel de carga y creación o edición de una sesión. El recorrido
terminó sin errores visibles. Este smoke test comprueba integración básica, pero no aporta datos al
coverage automatizado.

### Estado de cierre

El Pull Request 17 está fusionado y conserva la secuencia rojo-verde. El Pull Request 18 queda
abierto y bloqueado por coverage. Los checks requeridos continúan siendo `build-backend` y
`build-frontend`, con modo estricto. No se generaron capturas ni `evidencias.md`: cada prueba está
enlazada mediante su corrida o Pull Request verificable.

### Alcance de los asserts asistidos

En el mock backend, los asserts verifican resultado público, una única escritura, datos
normalizados y hash Argon2id; no cubren conflictos de unicidad devueltos por PostgreSQL. El test de
entrada inválida verifica `ValidationError` y cero escrituras; no comprueba todos los campos
inválidos porque esa matriz pertenece al test parametrizado de validación.

En `login`, los asserts del caso exitoso verifican el objeto devuelto y el contrato completo de la
única llamada HTTP; no cubren una respuesta exitosa con JSON malformado. Los del rechazo verifican
nombre, estado y cuerpo de `ApiError`, además de una sola llamada; no cubren una falla de red antes
de recibir respuesta. En sesión, los asserts verifican ambos lados y el borde exacto de expiración,
además del token sin payload y del payload sin `exp`; no cubren todas las formas posibles de JWT
corrupto. En YouTube, los
asserts verifican conversión exacta y rechazo de ejemplos concretos; no pretenden enumerar todos los
hosts maliciosos posibles. En el resumen de carga, los asserts verifican cada resultado, cantidades
inválidas y los cuatro bordes de clasificación; no cubren números fuera del rango seguro de
JavaScript porque el contrato HTTP usa enteros validados por el backend.

### Problemas encontrados

Los tests Node cargaban inicialmente un setup que asumía la existencia de `HTMLDialogElement`.
Protegí esos polyfills con una comprobación de disponibilidad para que el setup compartido funcione
tanto en jsdom como en Node. La primera medición también incluyó `.tsx` pese al alcance esperado;
agregué la exclusión explícita. Finalmente, el script backend dependía del directorio desde donde se
invocaba; ahora resuelve su propia ubicación antes de ejecutar Go y funciona tanto localmente como
dentro del contenedor. Al ejecutar la suite dentro de Docker apareció además un test no determinista:
alterar el último carácter Base64URL de una firma JWT puede conservar los mismos bits significativos.
Ahora se modifica el primer carácter de la firma por otro valor, por lo que el token cambia siempre.

### Uso de inteligencia artificial

Utilicé Codex para auditar la consigna, diseñar y escribir tests, introducir las interfaces mínimas
de inyección, configurar cobertura, targets Docker, workflow y esta documentación. Verifiqué la
asistencia ejecutando las suites, `go vet`, compilación frontend, los medidores y una mutación local
que hizo fallar el borde esperado. También revisé los reportes HTML y JSON para elegir los umbrales
y localizar la rama sin cubrir. Las operaciones de Git y GitHub se realizaron manualmente.

## TP6 — Entrega continua y entornos

### Artefacto publicado

El pipeline publica dos imágenes finales en GHCR, una para backend y otra para frontend. Cada tag
incluye el SHA completo del commit de `main` que la produjo. No uso `latest`, porque un tag móvil no
permite saber qué código contiene ni repetir un despliegue anterior con certeza.

La garantía depende de tres controles encadenados. La protección de `main` exige los checks verdes;
el login y el `push` a GHCR se habilitan solamente para un evento `push` sobre `main`; y la
construcción/publicación de la imagen final ocurre después de tests, coverage y artefactos. Si una
imagen se publicara antes de verificar, el registry dejaría de significar "versión aprobada" y sólo
sería un depósito de builds. Esta cadena no impide que un propietario publique manualmente con
`docker push`; para una garantía más fuerte usaría permisos de registry separados y promocionaría
por digest, no solamente por tag.

La imagen `scratch` del backend incorpora el bundle de certificados de CA. Sin él, el binario
estático puede compilar y arrancar, pero no validar el certificado TLS de Neon. Las imágenes fueron
comprobadas mediante pulls anónimos con una configuración Docker temporal sin credenciales.

### QA y producción

Los dos entornos usan servicios Render separados para API y frontend. Cada uno tiene una URL
pública y `Auto-Deploy` desactivado; Render sólo despliega cuando el workflow llama a sus hooks.
Neon contiene las bases `fitpro_qa` y `fitpro_prod`. Registré un usuario exclusivamente desde QA y
comprobé mediante SQL que existía en `fitpro_qa` y no en `fitpro_prod`.

La configuración que cambia por entorno queda afuera de las imágenes:

- Backend: `DATABASE_URL`, `HTTP_ADDR` y `JWT_SECRET`.
- Frontend: `BACKEND_URL` y `DNS_RESOLVER`.
- GitHub: hooks secretos y URLs públicas dentro de cada environment.

Dentro de la imagen permanecen el binario Go, las migraciones embebidas, los certificados, el
`dist` de Vite, Nginx y su plantilla. La imagen frontend define valores predeterminados útiles para
Compose, pero Render los reemplaza al arrancar. `NGINX_ENVSUBST_FILTER` limita la sustitución a las
dos variables de entorno y evita borrar variables propias de Nginx como `$uri` y `$host`. Por eso
la misma receta puede apuntar a la API QA o PROD sin recompilar el bundle.

Los secrets `RENDER_HOOK_API` y `RENDER_HOOK_FRONT` existen con el mismo nombre en `qa` y
`production`, pero su alcance es distinto. El job recibe únicamente los valores de su environment.
Las URLs no son credenciales y se guardan como variables `API_URL` y `FRONT_URL`. Ningún secret fue
copiado al repositorio ni impreso en logs.

### Cadena de promoción

`build-backend` y `build-frontend` continúan en paralelo. `deploy-qa` declara
`needs: [build-backend, build-frontend]`, corre sólo en pushes a `main` y usa el environment `qa` sin
reviewers. Los hooks reciben `&ref=$GITHUB_SHA`; así Render reconstruye el commit verificado y no la
punta que tenga la rama cuando procese la solicitud.

`deploy-prod` necesita que `deploy-qa` termine verde y usa el environment protegido `production`.
No repite el `if` de rama: en un PR, `deploy-qa` queda omitido y la dependencia impide llegar a
PROD. Producción exige a `GerMorini` como reviewer, con `Prevent self-review` desactivado. Además,
su grupo de concurrencia no cancela un despliegue iniciado, para evitar que dos promociones dejen
un estado ambiguo.

La [corrida automática de QA](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/37213103523)
muestra ambos builds, publicación, hooks y smoke verdes. La
[corrida rechazada](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/37214209194) llegó a QA,
pero bloqueó PROD con el motivo de revisar que ambos hooks apuntaran a servicios productivos. El
rechazo dejó la corrida roja sin ejecutar ningún step de producción. En la
[corrida aprobada](https://github.com/GerMorini/ingsoft3-tp01/actions/runs/37214810570), QA quedó
verde, el reviewer aprobó y el smoke de PROD terminó correctamente.

Implementé Continuous Delivery: todo merge verificado llega automáticamente a QA y queda listo para
PROD, pero una persona decide la promoción final. No es Continuous Deployment, porque ese último
gate sigue presente. En este proyecto individual el gate enseña y deja trazabilidad; en un sistema
con tests y observabilidad maduros, cambios de riesgo bajo podrían automatizarse y reservar el
control humano para operaciones sensibles. Desplegar pone una versión a correr; liberar una
funcionalidad a usuarios podría ser una decisión posterior mediante feature flags.

### Criterios del gate humano

Antes de aprobar revisé los checks requeridos, el smoke de QA, el commit mostrado como `Live` por
ambos servicios Render, las cuatro rutas públicas y el cambio visible esperado. También comprobé
separación de bases y destino de hooks. El aprobador no puede saber con esta evidencia si aumentó la
latencia, si hay errores poco frecuentes o si una regla de negocio degradó silenciosamente: faltan
métricas, trazas, alertas y pruebas sintéticas de flujos autenticados.

El rechazo no fue decorativo. Expresó que QA respondía, pero todavía debía verificarse que ambos
hooks productivos apuntaran a PROD y no a QA. GitHub registró quién rechazó, el motivo y que el job
no obtuvo acceso a los secrets productivos.

### Smoke tests y límites

Cada smoke realiza hasta 30 intentos separados por 20 segundos, con timeout de 10 segundos por
solicitud. Comprueba:

1. `/health` directo en la API: proceso HTTP vivo.
2. `/api/ready` directo: backend puede hacer `Ping` a PostgreSQL.
3. `/` en el frontend: Nginx sirve la SPA.
4. `/api/ready` mediante frontend: proxy, backend y base funcionan juntos.

No prueba login, autorización, escritura, reglas de negocio ni que la versión nueva sea la que
respondió. El hook de Render es asíncrono y la versión anterior permanece atendiendo durante el
build; por eso un smoke puede quedar verde antes de que termine el despliegue. Mitigué esa
limitación comprobando manualmente en Render el SHA `Live` y un texto visible. Una mejora futura es
exponer el SHA de compilación en `/health` y compararlo automáticamente con `$GITHUB_SHA`.

Render reconstruye desde el repositorio. Aunque usa el mismo commit, no ejecuta la imagen que CI
publicó: una imagen base o dependencia podría cambiar entre ambos builds. Por eso se pierde la
garantía binaria de "promover exactamente lo probado". El TP7 puede reemplazar esta reconstrucción
por el despliegue de la imagen GHCR identificada por tag o digest.

El tier gratuito de Render comparte 750 horas mensuales por workspace, duerme servicios inactivos y
puede introducir cold starts cercanos a un minuto. También limita minutos de build. Neon suspende
el cómputo inactivo y limita almacenamiento y horas de cómputo. Los reintentos absorben cold starts,
pero no resuelven agotamiento de cuota; en ese caso el pipeline falla y no debe promover.

### Estrategia para una producción real

Elegiría blue-green. Mantendría una versión activa y otra candidata, validaría la candidata con
smokes y cambiaría el tráfico de forma atómica. Si aparece un defecto, volvería el router a la
versión anterior sin reconstruir. Es apropiado para FitPro porque prioriza un rollback simple y
reduce el tiempo de indisponibilidad.

El costo es aproximadamente duplicar infraestructura durante la promoción. Las migraciones deben
seguir expand-contract: primero agregar cambios compatibles, desplegar ambas versiones y retirar
lo viejo después. No elegiría canary todavía. Repartir tráfico gradualmente sin métricas de error,
latencia, trazas y alertas por versión sólo distribuye el riesgo sin una señal objetiva para decidir
si avanzar o retroceder.

### Rollback ejecutado

Primero desplegué en PROD el commit
`45b93279c6a6560d254bab619c58dfc87498d9a2`, visible por el nuevo texto de Ejercicios. Después llamé
los dos hooks productivos con el commit bueno anterior
`352291fe670b0081be7095f8c7b093e96db21ed0`. Esperé que API y frontend mostraran ese SHA como `Live`
y repetí `/api/ready` y la comprobación del texto anterior.

Render registró estos tiempos:

| Servicio | Inicio | Live | Duración |
|---|---:|---:|---:|
| API PROD | 13:19:16 | 13:19:40 | 24 segundos |
| Front PROD | 13:19:16 | 13:19:43 | 27 segundos |
| Rollback completo | 13:19:16 | 13:19:43 | **27 segundos** |

La medición manual inicial dio 263 segundos porque incluyó el tiempo que tardé en observar y anotar
el estado. Para el valor técnico usé el inicio más temprano y el `Live` más tardío de Render. La
prueba ejercita el tiempo medio de restauración, una métrica DORA.

El procedimiento actual es identificar el último SHA bueno, copiar los hooks PROD sin exponerlos,
llamarlos con `&ref=<sha>`, esperar ambos estados `Live` y ejecutar los cuatro smokes. Este rollback
revierte código, no datos. Una migración destructiva o escrituras incompatibles exigirían backup,
PITR y un plan de restauración; las migraciones embebidas actuales son ascendentes y no sustituyen
esa estrategia.

### Problemas encontrados

- La imagen `scratch` no tenía certificados raíz para Neon. Copié solamente el bundle de CA desde
  la etapa de build.
- Nginx tenía fija la dirección `backend:8080`. La convertí en plantilla procesada al arrancar y
  limité `envsubst` para conservar sus variables internas.
- El environment `production` quedó inicialmente con `Prevent self-review: true`. Lo detecté con la
  API de GitHub y lo corregí antes de fusionar el gate.
- Al revisar el primer despliegue pareció que sólo se reconstruía el frontend. Los logs de Actions
  mostraron dos IDs de deploy distintos y Render confirmó ambos builds.
- El smoke puede consultar la versión anterior mientras Render construye. Conservé esa limitación
  explícita y verifiqué el commit en Render antes de aprobar.
- El cronómetro manual sobreestimó el rollback. Recalculé el dato con timestamps de inicio y `Live`
  de ambos despliegues.

No creé capturas ni `evidencias.md`. Las corridas, deployments, paquetes y releases son recursos
navegables del repositorio público.

### Uso de inteligencia artificial

Utilicé Codex para auditar la guía, implementar health y readiness, adaptar Docker y Nginx,
configurar publicación, jobs de deploy, smokes y redactar esta sección. También asistió en el
diagnóstico de environments, hooks y medición del rollback.

Verifiqué la asistencia con `go test ./...`, `go vet ./...`, coverage, 60 tests frontend, build de
Vite, builds y targets Docker, `actionlint`, Docker Compose y consultas HTTP reales. Revisé los logs
de Actions, los commits `Live` y los datos separados en Neon. Las cuentas, secrets, operaciones Git,
squash merges, configuración externa, rechazo, aprobación y rollback fueron ejecutados manualmente.

## TP7 — Contenedores, integración y E2E

### Build once, deploy many

En TP6 el pipeline publicaba imágenes, pero Render reconstruía el mismo commit para cada entorno.
Dos construcciones del mismo código pueden resolver una imagen base o dependencia diferente y
producir binarios distintos. En TP7 la unidad de release pasó a ser la imagen: CI la construye y
publica una vez, QA la prueba y PROD recibe exactamente la misma referencia.

Los cuatro servicios existentes se cambiaron en el mismo lugar de Git a `Existing Image`; no creé
servicios ni URLs nuevas. La imagen configurada inicialmente fue la del último merge de TP6,
`sha-af443cb94915c355dc810285e8a572afc9020302`. Esa referencia es solamente el valor predeterminado
del servicio. No es necesariamente la que corre después: cada hook recibe `imgURL` con el SHA de su
corrida y Render despliega esa etiqueta sin cambiar el valor predeterminado.

Las imágenes se publican al terminar los jobs `build-backend` y `build-frontend`, antes del deploy
de QA y antes de la aprobación productiva. Publicarlas no actualiza Render: un servicio basado en
imagen no observa automáticamente el registry. `deploy-qa` solicita expresamente la imagen nueva y
la aprobación sólo habilita que `deploy-prod` solicite esa misma referencia. De esa forma registrar
un artefacto y ejecutarlo son operaciones independientes.

Cada imagen tiene una única etiqueta `sha-<commit>`; no publico `latest` porque es un puntero móvil y
no permite reconstruir la historia de una promoción. La etiqueta por commit aporta trazabilidad,
pero sigue siendo mutable si alguien vuelve a publicarla. El digest `sha256:…` identifica contenido
inmutable y sería el paso siguiente para una garantía criptográfica completa.

Git usa `v7.0.0` como nombre humano de la release. Para llegar de la release al binario se obtiene el
commit con `git rev-list -n1 v7.0.0` y se busca `sha-<ese commit>` en ambos paquetes. El tag se coloca
sobre el deployment activo de `production`, no simplemente sobre el último commit de `main`.

Desde afuera, el workflow muestra el `imgURL` exacto utilizado y GHCR muestra la misma etiqueta. En
Render, los Events de API y frontend indican `Triggered via Deploy Hook` y nombran esa imagen. El
smoke no demuestra identidad: sólo confirma que API, base, frontend y proxy responden; una versión
anterior todavía viva también podría contestarlo. Por eso la comprobación de Events sigue siendo
manual en este TP.

### Integración amplia contra QA

La suite `frontend/e2e/api.spec.js` utiliza el fixture HTTP `request` de Playwright, sin navegador,
dobles ni una base levantada en el runner. Se autentica contra la API pública de QA y recorre el
driver y PostgreSQL reales. Sus tres pruebas son:

1. Crear un ejercicio, encontrarlo en el listado, borrarlo y comprobar su ausencia.
2. Enviar un nombre vacío, comprobar `400`, el error de `name` y que ningún ID nuevo aparezca.
3. Crear, actualizar, consultar el valor persistido, borrar y comprobar la ausencia.

Las pruebas crean nombres con timestamp y UUID. Las que escriben guardan el ID y ejecutan limpieza
defensiva en `finally`, además de afirmar el borrado dentro del flujo. Reutilizan un usuario técnico
de QA guardado como `QA_TEST_USERNAME` y `QA_TEST_PASSWORD` en secrets del environment `qa`; crear
un usuario por corrida habría dejado datos sin forma de eliminar porque FitPro no expone borrado de
cuentas.

Esta es integración amplia: prueba además que el despliegue público, configuración, red, driver y
base real se entiendan. Frente a una integración estrecha, gana fidelidad y evita mantener otro
PostgreSQL en Actions. Pierde aislamiento, depende de disponibilidad externa y llega después del
deploy. Una suite estrecha con API y PostgreSQL descartables fallaría antes y sería más determinista,
pero exigiría más infraestructura y no comprobaría el entorno ya desplegado.

### Flujos E2E reales

La suite `frontend/e2e/fitpro.spec.js` usa Chromium contra el frontend público de QA. No intercepta
red ni inventa respuestas. Cada prueba inicia sesión mediante UI, abre Ejercicios e interactúa con
controles por roles y nombres accesibles. Los tres flujos son:

1. Crear un ejercicio, verlo en su tarjeta, eliminarlo y comprobar que desaparece.
2. Intentar crear sin nombre, ver `Nombre es obligatorio` y comprobar que la lista no cambia.
3. Crear, editar, recargar, comprobar persistencia, eliminar y comprobar desaparición.

Elegí creación y edición porque son operaciones centrales de FitPro y atraviesan frontend, proxy,
autenticación, API y base. No repetí bordes de contraseña, JWT, URLs multimedia ni reglas numéricas:
los unitarios los cubren con mayor velocidad y diagnóstico. La integración tampoco valida botones o
mensajes, y la E2E no reemplaza la precisión de los unitarios; cada capa responde una pregunta
distinta.

Playwright usa 60 segundos por test, 15 por assertion y un solo retry. Los tiempos permiten absorber
latencia del tier gratuito después de que el smoke despierta QA. No hay `sleep`: Playwright espera
condiciones observables. Un test que pasa recién al reintentar queda marcado como flaky; si se repite,
debe corregirse porque un rojo intermitente entrena al equipo a ignorar fallos reales. Un solo worker
evita que las pruebas de cada suite compitan por la misma cuenta.

### Gate y diagnóstico demostrado

La cadena declara `integracion` con `needs: deploy-qa`, `e2e` con `needs: integracion` y
`deploy-prod` con `needs: e2e`. Sólo los pasos que publican reportes usan `!cancelled()`. Las pruebas
no tienen `continue-on-error`, `|| true`, salidas artificiales ni skips. Por eso un fallo impide que
producción siquiera solicite aprobación.

Para probar que el gate podía decir que no, el commit
`a2ccfb8f8d4ad6867f2355bf33ba7763a35e32b5` cambió código real del frontend: el alta llamó a
`POST /api/exercise` en vez de `POST /api/exercises`. No se modificaron los tests. Compilación, 60
unitarios y coverage quedaron verdes; QA desplegó y el smoke también quedó verde. La integración
directa completó `3 passed`, mientras la E2E terminó con dos flujos rojos, uno verde y PROD omitido.

El diagnóstico salió del reporte, no de releer el cambio: la traza de red mostró
`POST /api/exercise → 404`; el wizard permanecía abierto después de guardar. Integración verde más
E2E roja significa que API y base podían crear, leer, actualizar y borrar correctamente, pero el
frontend dejó de usar el contrato adecuado. Si se hubiera roto la API, integración habría quedado
roja y E2E no habría arrancado.

El endpoint se restauró en `ebc822ee8b165ba26c1717f7dae484faee5d08af`. La corrida posterior dejó
las seis pruebas verdes, llegó al reviewer de `production` y promovió el mismo tag verificado en QA.

### Configuración, límites y recuperación

La imagen frontend es idéntica en ambos entornos. El bundle no contiene la dirección de la API:
Nginx resuelve `BACKEND_URL` al arrancar. QA configura la API QA y PROD la API PROD; cambiar entorno
no recompila Vite ni crea otra imagen.

QA es compartido por todas las corridas. Dos merges próximos podrían hacer que una corrida pruebe la
imagen desplegada por otra. Se reconoce comparando el SHA del run con Events y horarios de Render.
La corrida anterior se descarta, no se reejecutan solamente sus pruebas y se considera válida la más
nueva que incluye ambos cambios. Durante este TP apliqué la regla de un merge por vez. Un sistema real
usaría un entorno efímero por corrida.

Si una imagen promovida falla, la recuperación consiste en enviar al hook la etiqueta o digest de
una versión anterior que permanezca en GHCR. No necesita reconstrucción. Las migraciones continúan
siendo un riesgo separado: volver el contenedor no revierte datos ni garantiza compatibilidad hacia
atrás.

### Problemas encontrados

- Render no redesplegó al cambiar la fuente del primer servicio. Ejecuté la única prueba manual
  permitida mediante su deploy hook y confirmé `Triggered via Deploy Hook` con la imagen elegida.
- Los selectores iniciales de contraseña y del botón `Crear ejercicio` coincidían con controles de
  cierre cuyos nombres contenían el mismo texto. Los hice inequívocos mediante rol y coincidencia
  exacta, sin recurrir a clases CSS.
- Compose conservaba una contraseña PostgreSQL de un volumen anterior. Reutilicé el `.env` local en
  lugar de destruir datos o cambiar la credencial persistida.
- Un contenedor de validación dejó reportes locales con propietario root. Corregí únicamente permisos
  de las carpetas generadas, que además están ignoradas por Git.
- `npm audit` reportó cuatro vulnerabilidades sólo en herramientas de desarrollo preexistentes
  (`vitest` y `undici` mediante jsdom); `npm audit --omit=dev` quedó en cero. No cambié las versiones
  fijadas para TP5 dentro de este trabajo.

No agregué capturas ni `evidencias.md`. Actions conserva ambas suites y sus reportes; Render Events,
que no son públicos, se mostrarán en vivo durante la defensa.

### Uso de inteligencia artificial

Utilicé Codex para auditar la consigna, adaptar Playwright a los contratos de FitPro, escribir las
seis pruebas, configurar sus reportes, encadenar el workflow, diagnosticar la corrida roja y redactar
esta sección. La configuración de Render, usuario técnico, secrets, operaciones Git, squash merges y
aprobaciones fueron ejecutadas manualmente.

Verifiqué la asistencia con 60 unitarios, coverage, build de Vite, `actionlint`, Docker, Compose,
tres pruebas HTTP contra PostgreSQL, tres flujos Chromium, pulls anónimos de ambas imágenes y las
corridas reales. Para cada prueba revisé sus assertions y su límite: las de integración no ven la
pantalla; las E2E sólo cubren los tres recorridos elegidos; ninguna demuestra identidad de imagen sin
contrastar Events o incorporar el SHA al endpoint de vida.
