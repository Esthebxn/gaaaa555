# ZoomTV

Sistema de ZoomTV Canal 10 con tres partes:

| Carpeta | Qué es | Puerto |
|---|---|---|
| `backend` | API Node/Express + MySQL/MariaDB | 3000 |
| `Zoomtv2.0respaldo` | Web pública (Vite + React) | 3002 |
| `mysql_cms` | Dashboard de administración | 3005 |

## 1. Programas necesarios

Instala esto antes de clonar:

1. **Git**: https://git-scm.com
2. **Node.js 24** (o 18+): https://nodejs.org
3. **XAMPP** (MySQL/MariaDB 10.4): https://www.apachefriends.org
4. **VS Code**: https://code.visualstudio.com
5. Opcional: **MySQL Workbench**, para importar la base de datos con interfaz.

Las versiones exactas y las dependencias npm están en `PLUGINS.md`.

## 2. Clonar el proyecto

```powershell
git clone https://github.com/Esthebxn/gaaaa555.git
cd gaaaa555
```

Si PowerShell no deja ejecutar scripts:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 3. Extensiones de VS Code (opcional)

```powershell
.\instalar_extensiones.ps1
```

Las extensiones de IA (ChatGPT, DeepSeek, NVIDIA, Claude) piden su API key otra vez, porque las claves no viajan con el repositorio.

## 4. Instalar dependencias

```powershell
.\instalar.ps1
```

Ejecuta `npm install` en `backend`, `Zoomtv2.0respaldo` y `mysql_cms`, y crea `backend\.env` a partir de `backend\env.example`.

Si prefieres hacerlo a mano:

```powershell
cd backend; npm install; cd ..
cd Zoomtv2.0respaldo; npm install; cd ..
cd mysql_cms; npm install; cd ..
copy backend\env.example backend\.env
```

## 5. Configurar backend\.env

Abre `backend\.env` y completa los valores de conexión a MySQL. Con XAMPP normalmente el usuario es `root` y la contraseña está vacía. El nombre de la base de datos que pongas aquí debe ser el mismo que crees en el paso 6.

## 6. Crear la base de datos

1. Abre XAMPP y pulsa **Start** en **MySQL**.
2. Crea la base de datos (cambia `zoomtv` si usas otro nombre en `.env`):

```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS zoomtv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

3. Importa la estructura:

```powershell
cmd /c '"C:\xampp\mysql\bin\mysql.exe" -u root zoomtv < backend\database\schema.sql'
```

4. Si tienes el respaldo con datos (`zoomtv_completo.sql`, dentro de `Zoomdbdatabasetodoslosmodelos.zip`), impórtalo en vez del `schema.sql`. En Workbench: **Server > Data Import > Import from Self-Contained File**. Ese ZIP contiene datos reales y no está en GitHub.

## 7. Imágenes

Las imágenes subidas desde el panel se guardan en `backend\uploads`. Esa carpeta está en el repositorio, así que al clonar ya vienen incluidas.

## 8. Encender el sistema

```powershell
.\iniciar.ps1
```

Abre tres ventanas. Las direcciones son:

- Web pública: http://localhost:3002
- Dashboard: http://localhost:3005
- Comprobación de la API: http://localhost:3000/api/health (debe decir `status: ok` y `database: connected`)

Para encender cada parte a mano, usa una terminal por cada una:

```powershell
cd backend; node server.js
cd Zoomtv2.0respaldo; npm run dev -- --port 3002
cd mysql_cms; npm run dev -- --port 3005
```

## 9. Compilar para publicar

```powershell
cd Zoomtv2.0respaldo; npm run build
cd ..\mysql_cms; npm run build
```

Genera la carpeta `dist` de cada proyecto.

## 10. Publicar web, dashboard y API

La web y el dashboard usan la misma API (`VITE_API_URL`) y el backend usa la misma base de datos MySQL. No configures el navegador para conectarse directamente a MySQL.

### Base de datos

1. Crea una base MySQL accesible desde el backend publicado. Usa `zoomtv_db` o cambia `DB_NAME` para que coincida.
2. Importa `backend/database/schema.sql` en la base. Si tienes un respaldo completo con los datos actuales, importa ese respaldo en vez del esquema de ejemplo.
3. Conserva el host, puerto, usuario, contraseña y si el proveedor exige SSL.

### Backend

1. Crea un servicio Railway conectado a este repositorio y configura `backend` como Root Directory.
2. Usa `npm start` como comando de inicio.
3. Carga en Railway `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET` y `CORS_ORIGINS`. Configura `GEMINI_API_KEY` solo si habilitas Gemini. Genera un `JWT_SECRET` aleatorio, largo y único; no copies los valores de ejemplo.
4. Genera el dominio público de la API y abre `/api/health`. Debe responder `status: ok` y `database: connected`.
5. Las subidas se guardan en `UPLOADS_DIR`. Para Railway, monta un volumen en `/app/uploads` y configura `UPLOADS_DIR=/app/uploads`. Sin almacenamiento persistente, las imágenes nuevas pueden perderse al reemplazar el servicio.

### Vercel

Despliega dos proyectos desde el mismo repo. Para la web usa Root Directory `Zoomtv2.0respaldo`; para el dashboard usa `mysql_cms`. En ambos selecciona Vite, Build Command `npm run build`, Output Directory `dist`, y configura `VITE_API_URL=https://TU-DOMINIO-API/api`. Cada carpeta contiene `vercel.json` para que funcionen las rutas al recargar.

Después de obtener los dos dominios de Vercel, asigna `CORS_ORIGINS` en Railway con ambos orígenes exactos, separados por coma y sin barra final. Vuelve a desplegar el backend para aplicar el cambio.

### Acceso y comprobación

El login del dashboard consulta `POST /api/auth/login`. Crea `ADMIN_USERNAME` y `ADMIN_PASSWORD` como variables secretas en Railway. El backend entrega un token firmado que el dashboard envía al crear, editar, borrar o subir archivos. Todas las escrituras de la API requieren ese token; las lecturas y el endpoint público del chatbot siguen disponibles.

Prueba iniciar sesión en el dashboard, crear una noticia y verla en la web. Revisa las imágenes y abre directamente una ruta interna de la web, luego recárgala. Para desarrollo local crea `.env.local` dentro de cada frontend con `VITE_API_URL=http://localhost:3000/api`.

<!-- PLUGINS:START -->
## Plugins y extensiones

### Extensiones de VS Code

Para instalarlas todas de una vez:

```powershell
.\instalar_extensiones.ps1
```

Para instalar una sola: `code --install-extension ID`.

**Necesarias para programar el proyecto (React):**

| Extensión | ID | Versión |
|---|---|---|
| ES7+ React/Redux Snippets | `dsznajder.es7-react-js-snippets` | 4.4.3 |
| Simple React Snippets | `burkeholland.simple-react-snippets` | 1.2.8 |
| React Native Tools | `msjsdiag.vscode-react-native` | 1.13.0 |
| gitignore | `codezombiech.gitignore` | 0.10.0 |
| Start Git Bash | `mccarter.start-git-bash` | 1.2.1 |
| Paquete de idioma español | `ms-ceintl.vscode-language-pack-es` | 1.131 |

**Asistentes de IA (opcionales, piden su propia API key en cada PC):**

| Extensión | ID | Versión |
|---|---|---|
| Claude Code | `anthropic.claude-code` | 2.1.312 |
| Claude Code Extension (CodeFlow Studio) | `codeflow-studio.claude-code-extension` | 0.1.10 |
| ChatGPT (OpenAI) | `openai.chatgpt` | 26.1021.22027 |
| Codex Audio (OpenAI) | `openai.codex-audio` | 26.1021.22027 |
| DeepSeek Code Generator | `daviddai.deepseek-code-generator` | 2.0.0 |
| NVIDIA NIM Provider | `hidenobunagai.nvidia-nim-provider` | 0.3.8 |
| ChatGPT (ikasann-self) | `ikasann-self.vscode-chat-gpt` | 1.2.0 |
| Google Antigravity | `google.google-antigravity` | 1.10.0 |

**Apariencia (opcionales):**

| Extensión | ID | Versión |
|---|---|---|
| Material Icon Theme | `pkief.material-icon-theme` | 5.40.0 |
| Doki Theme | `unthrottled.doki-theme` | 88.1.18 |
| VSCode Pokemon | `jakobhoeg.vscode-pokemon` | 5.0.2 |

> Las API keys de las extensiones de IA no viajan con el repositorio. Hay que ingresarlas de nuevo en cada PC.

### Herramientas del sistema

| Herramienta | Versión usada |
|---|---|
| Node.js | v24.14.0 |
| npm | 11.9.0 |
| Git | 2.53.0 |
| XAMPP (MariaDB) | 10.4.32 |

### Dependencias npm (se instalan solas con `npm install`)

**backend:** express, cors, body-parser, dotenv, multer, mysql2, nodemon

**Zoomtv2.0respaldo (web pública):** react 19, react-dom, react-router-dom, react-helmet, react-icons, axios, hls.js, prop-types, tailwindcss, @tailwindcss/vite, vite 7, @vitejs/plugin-react, eslint, postcss, autoprefixer

**mysql_cms (dashboard):** react 19, react-dom, react-router-dom, @headlessui/react, framer-motion, lucide-react, typescript, typescript-eslint, vite 7, @vitejs/plugin-react, eslint

La lista completa con versiones está en `PLUGINS.md`.
<!-- PLUGINS:END -->

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `ERR_CONNECTION_REFUSED` en `:3000` | El backend está apagado. Enciéndelo con `cd backend; node server.js`. |
| `database: unavailable` en `/api/health` | MySQL está apagado (XAMPP) o los datos de `backend\.env` son incorrectos. |
| `Port 3000/3002/3005 is already in use` | Ya hay una copia encendida. Ciérrala o usa esa. |
| Las imágenes no se ven | Comprueba que el backend esté encendido y que exista `backend\uploads`. |
| Cambios del panel que no aparecen | Recarga con `Ctrl+F5`. Si sirves `dist`, vuelve a ejecutar `npm run build`. |

## Notas de seguridad

- `backend\.env` no se sube a GitHub, porque contiene contraseñas.
- No subas los respaldos de la base de datos (`Zoomdbdatabasetodoslosmodelos.zip`).
- Si una API key llegó a subirse al repositorio, revócala y crea una nueva.

Este es el SQL completo que tiene el proyecto para crear la base `zoomtv_db`, sus tablas y los datos de ejemplo iniciales. Puedes copiarlo y ejecutarlo en MySQL:

```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS zoomtv_db;
USE zoomtv_db;

-- Tabla para la sección Nosotros
CREATE TABLE IF NOT EXISTS nosotros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    mision TEXT,
    vision TEXT,
    valores TEXT,
    imagen_url VARCHAR(500),
    nombre_empresa VARCHAR(255),
    slogan VARCHAR(500),
    email VARCHAR(100),
    telefono VARCHAR(20),
    historia TEXT,
    equipo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para Noticias
CREATE TABLE IF NOT EXISTS noticias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    resumen TEXT,
    categoria VARCHAR(100),
    autor VARCHAR(100),
    imagen_url VARCHAR(500),
    fecha_publicacion DATETIME,
    destacada BOOLEAN DEFAULT FALSE,
    activa BOOLEAN DEFAULT TRUE,
    descripcion TEXT,
    imagen VARCHAR(500),
    fecha VARCHAR(50),
    fuente VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para Programación
CREATE TABLE IF NOT EXISTS programacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_programa VARCHAR(255) NOT NULL,
    descripcion TEXT,
    horario_inicio TIME NOT NULL,
    horario_fin TIME NOT NULL,
    dia_semana ENUM(
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo'
    ) NOT NULL,
    conductor VARCHAR(100),
    categoria VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    hora VARCHAR(20),
    programa VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para Anunciantes
CREATE TABLE IF NOT EXISTS anunciantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(255) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    descripcion TEXT,
    logo_url VARCHAR(500),
    sitio_web VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    nombre VARCHAR(255),
    categoria VARCHAR(100),
    horario VARCHAR(100),
    imagen VARCHAR(500),
    flyer VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para transmisión en vivo
CREATE TABLE IF NOT EXISTS live_stream (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    url_stream VARCHAR(500) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Preguntas frecuentes de Zoom TV Assistant
CREATE TABLE IF NOT EXISTS assistant_faq (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta VARCHAR(500) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    palabras_clave TEXT,
    respuesta TEXT,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_assistant_faq_question (pregunta(191))
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Redes sociales de Zoom TV Assistant
CREATE TABLE IF NOT EXISTS assistant_social_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plataforma VARCHAR(80) NOT NULL UNIQUE,
    url VARCHAR(1000) NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Datos de ejemplo para Nosotros
INSERT INTO nosotros (
    titulo,
    descripcion,
    mision,
    vision,
    valores,
    nombre_empresa,
    slogan,
    email,
    telefono,
    historia
) VALUES (
    'ZoomTV',
    'Somos una televisora local comprometida con la comunidad',
    'Informar, entretener y educar a nuestra audiencia con contenido de calidad',
    'Ser la televisora líder en nuestra región',
    'Transparencia, compromiso, innovación y servicio a la comunidad',
    'Zoom TV Canal 10',
    'Información veraz, entretenimiento de calidad',
    'contacto@zoomtvcanal10.com',
    '+51 999 888 777',
    'Zoom TV Canal 10 nació en 2005 con la misión de llevar información veraz y entretenimiento de calidad a nuestros televidentes. Hoy contamos con más de 50 profesionales dedicados a la producción de contenido audiovisual de alta calidad.'
);

-- Datos de ejemplo para Noticias
INSERT INTO noticias (
    titulo,
    contenido,
    resumen,
    categoria,
    autor,
    destacada,
    descripcion,
    imagen,
    fecha,
    fuente
) VALUES
(
    '🚧 Intervendrán 27 puntos críticos de la Carretera Central desde este lunes',
    'El Ministerio de Transportes y Comunicaciones (MTC) informó que se intervendrán 27 puntos críticos en la Carretera Central para garantizar la seguridad vial durante la temporada de lluvias. Estas labores incluirán la estabilización de taludes, limpieza de derrumbes y mejoramiento de la capa asfáltica. La primera etapa abarcará desde Huachipa hasta Matucana, con la participación del Ejército Peruano y Provías Nacional.',
    'El Ministerio de Transportes y Comunicaciones (MTC) informó que se intervendrán 27 puntos críticos en la Carretera Central para garantizar la seguridad vial durante la temporada de lluvias.',
    'Nacionales',
    'Redacción ZoomTV',
    TRUE,
    'El Ministerio de Transportes y Comunicaciones (MTC) informó que se intervendrán 27 puntos críticos en la Carretera Central para garantizar la seguridad vial durante la temporada de lluvias. Estas labores incluirán la estabilización de taludes, limpieza de derrumbes y mejoramiento de la capa asfáltica.',
    'carretera_central.jpg',
    '03 octubre 2025',
    'Andina.pe'
),
(
    '⚽ Perú derrota 2-0 a Ecuador en amistoso internacional',
    'Perú venció a Ecuador 2-0 en un amistoso jugado en Lima. Lapadula abrió el marcador al minuto 23 tras una gran jugada colectiva, mientras que Cueva cerró el encuentro con un golazo desde fuera del área. El equipo dirigido por Fossati se mostró sólido y con mayor orden táctico.',
    'Perú venció a Ecuador 2-0 en un amistoso jugado en Lima. Lapadula abrió el marcador al minuto 23 tras una gran jugada colectiva.',
    'Deportes',
    'Reportero Deportivo',
    FALSE,
    'Perú venció a Ecuador 2-0 en un amistoso jugado en Lima. Lapadula abrió el marcador al minuto 23 tras una gran jugada colectiva, mientras que Cueva cerró el encuentro con un golazo desde fuera del área.',
    'peru_ecuador.jpg',
    '03 octubre 2025',
    'Depor.pe'
);

-- Datos de ejemplo para Programación
INSERT INTO programacion (
    nombre_programa,
    descripcion,
    horario_inicio,
    horario_fin,
    dia_semana,
    conductor,
    categoria,
    hora,
    programa
) VALUES
(
    'Despertar Contigo',
    'Programa matutino con noticias, música y entrevistas',
    '06:00:00',
    '07:00:00',
    'Lunes',
    'María González',
    'Entretenimiento',
    '06:00 AM',
    'Despertar Contigo'
),
(
    'Noticias del Día',
    'Resumen de las noticias más importantes de la mañana',
    '09:00:00',
    '10:00:00',
    'Lunes',
    'Carlos López',
    'Noticias',
    '09:00 AM',
    'Noticias del Día'
),
(
    'Al Mediodía',
    'Programa de variedades con cocina en vivo y música',
    '12:00:00',
    '13:00:00',
    'Lunes',
    'Laura Jiménez',
    'Variedades',
    '12:00 PM',
    'Al Mediodía'
),
(
    'Deportes en Acción',
    'Resumen deportivo con análisis y entrevistas',
    '17:00:00',
    '18:00:00',
    'Lunes',
    'Roberto Sánchez',
    'Deportes',
    '05:00 PM',
    'Deportes en Acción'
);

-- Datos de ejemplo para Anunciantes
INSERT INTO anunciantes (
    nombre_empresa,
    contacto,
    telefono,
    email,
    descripcion,
    nombre,
    categoria,
    horario,
    imagen,
    flyer
) VALUES
(
    'Restaurante La Tradición',
    'Juan Pérez',
    '+51 987 654 321',
    'contacto@latradicion.com',
    'Los mejores sabores de la cocina peruana en un ambiente acogedor y familiar. Especialistas en comida criolla y mariscos frescos.',
    'Restaurante La Tradición',
    'Gastronomía',
    'Lun-Dom: 12:00 PM - 11:00 PM',
    'restaurante_tradicion.jpg',
    'flyer_restaurante.jpg'
),
(
    'AutoServicio Rápido',
    'Ana Martínez',
    '+51 955 444 333',
    'info@autoservicio.com',
    'Taller mecánico especializado en mantenimiento preventivo y correctivo de vehículos. Servicio rápido y garantizado.',
    'AutoServicio Rápido',
    'Automotriz',
    'Lun-Sáb: 8:00 AM - 6:00 PM',
    'autoservicio_rapido.jpg',
    'flyer_autoservicio.jpg'
);

-- Datos de ejemplo para transmisión en vivo
INSERT INTO live_stream (
    titulo,
    url_stream,
    descripcion,
    activo
) VALUES (
    'Zoom TV Live Stream',
    'https://player.kick.com/elmacarius?hideHeader=true&hideChat=true',
    'Transmisión en vivo de Zoom TV Canal 10',
    TRUE
);
```

Este es el SQL de esquema y ejemplos que está en el proyecto. Las noticias y anunciantes adicionales se cargan desde un script JavaScript aparte; no están guardados como SQL en el repositorio.

