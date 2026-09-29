# SonarQube local en Windows

Versiones: SonarQube Community Build 26.9.0.129388 y SonarScanner CLI 8.1.0.6389.
Requiere JDK 21 o 25. La instalacion vive en `.tools/sonarqube/`, fuera de Git.
Usa la base H2 incorporada para evaluacion local; para un servidor compartido se debe configurar PostgreSQL.

## Instalar en otro equipo

Desde la raiz del repositorio en PowerShell:

```powershell
New-Item -ItemType Directory -Force .tools/sonarqube
curl.exe -fL -o .tools/sonarqube/server.zip https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-26.9.0.129388.zip
curl.exe -fL -o .tools/sonarqube/scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-8.1.0.6389.zip
Expand-Archive .tools/sonarqube/server.zip .tools/sonarqube
Expand-Archive .tools/sonarqube/scanner.zip .tools/sonarqube
Add-Content .tools/sonarqube/sonarqube-26.9.0.129388/conf/sonar.properties "`nsonar.web.host=127.0.0.1"
```

## Iniciar y analizar

```powershell
.\scripts\start-sonarqube.ps1
```

Abrir http://localhost:9000. En una instalacion nueva el usuario y clave iniciales son `admin`; cambiar la clave al entrar.
Crear un proyecto local con clave `acaro-org` y generar un token de analisis para ese proyecto.

```powershell
$env:SONAR_TOKEN = 'token-generado-en-sonarqube'
.\scripts\run-sonarqube.ps1
Remove-Item Env:SONAR_TOKEN
```

Resultados: http://localhost:9000/dashboard?id=acaro-org.
Los tokens no deben guardarse en archivos versionados.
El scanner descarga automaticamente el runtime Node necesario para analizar JavaScript/TypeScript.
El script espera a que el servidor termine de procesar el informe y falla si ese procesamiento falla.
No modificar el codigo durante el analisis, ya que el scanner necesita leer una version consistente de los archivos.

## Cobertura

El desarrollo y CI usan Node.js 24 (minimo 24.9 para Jest). `.nvmrc` especifica la version mayor.
La aplicacion admite Node.js desde 22.12 para mantener compatibilidad con el alojamiento.
Las pruebas de Jest usan `--experimental-vm-modules` para cargar las dependencias ESM del sanitizador actualizado.
En este equipo se instalo Node 24.21.0 dentro del proyecto. Para habilitarlo en la sesion de PowerShell:

```powershell
$env:PATH = "$PWD\.tools\node\node-v24.21.0-win-x64;$env:PATH"
```

Con Node.js y las dependencias del backend instalados:

```powershell
npm --prefix backend test -- --coverage --collectCoverageFrom='src/**/*.js'
```

Repetir el analisis para importar `backend/coverage/lcov.info`. La configuracion tambien admite
`frontend/coverage/lcov.info` cuando exista una suite que lo genere. Sin estos informes,
el analisis estatico funciona, pero no demuestra cobertura de pruebas.

## Interpretar el resultado

Un informe procesado correctamente no implica que el Quality Gate este aprobado.
Consulta el panel para revisar sus condiciones: la cobertura de codigo nuevo debe
alcanzar el umbral configurado (80 % en el gate actual). Las comprobaciones manuales
o de navegador sin instrumentacion no se cuentan como cobertura. No se deben excluir
archivos ni reducir el umbral solo para obtener un resultado verde.

## Detener

La instalacion se inicia como proceso de consola oculto, no como servicio Windows.
Para detenerla, finalizar solamente los procesos Java pertenecientes a
`.tools/sonarqube/sonarqube-26.9.0.129388` desde el Administrador de tareas.
Los registros estan en su carpeta `logs`.

## Credenciales de esta instalacion

Si se inicializo automaticamente, la clave de administrador esta cifrada con DPAPI en
`.tools/sonarqube/admin.xml`. Solo la cuenta de Windows que la creo puede leerla:

```powershell
(Import-Clixml .tools/sonarqube/admin.xml).GetNetworkCredential().Password
```

El script de analisis usa el token cifrado en `.tools/sonarqube/token.xml` si no se define
`SONAR_TOKEN`. Ambos archivos estan excluidos de Git.

Documentacion: https://docs.sonarsource.com/sonarqube-community-build/
