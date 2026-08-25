# Decisiones técnicas

## TP3 — Planificación y trazabilidad

### Duración del sprint

Se definió una duración de **3 semanas** para el sprint. Al tratarse de un trabajo individual y orientado principalmente a practicar el uso de una herramienta de planificación, se consideró un período suficientemente amplio para organizar las tareas, familiarizarse con GitHub Projects y completar el trabajo sin necesidad de dividirlo en iteraciones demasiado cortas.

La elección también busca mantener una planificación simple y acorde al alcance académico del TP, evitando agregar complejidad innecesaria.

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
