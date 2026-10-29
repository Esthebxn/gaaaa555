# Zoom TV Canal 10 - React App

Este es un proyecto React para la página web de Zoom TV Canal 10.

## Base de datos de Zoom TV

El proyecto guarda su contenido en una base **MySQL/MariaDB** llamada **`zoomtv_db`**. La web y el dashboard no se conectan directamente a la base: ambos envían sus consultas a la API de ZoomTV, y la API lee o actualiza las tablas de MySQL.

### Qué información guarda cada tabla

| Tabla | Información almacenada |
| --- | --- |
| `noticias` | Titular, contenido, resumen, categoría, imagen, fecha, fuente y estado de publicación. |
| `programacion` | Nombre del programa, día, hora de inicio y fin, conductor, categoría y estado. |
| `anunciantes` | Empresa, contacto, teléfono, correo, dirección, horario, web, categoría e imágenes. |
| `nosotros` | Nombre de Zoom TV, descripción, historia, misión, visión, valores, equipo y datos de contacto. |
| `live_stream` | Título, URL de transmisión, descripción y estado activo. |
| `assistant_faq` | Preguntas frecuentes y palabras clave que usa Zoom TV Assistant. |
| `assistant_social_links` | Plataformas sociales y sus enlaces oficiales. |

### Esquema SQL de las tablas

Este es el esquema de `zoomtv_db` que utiliza el backend:

```sql
CREATE DATABASE IF NOT EXISTS zoomtv_db;
USE zoomtv_db;

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

CREATE TABLE IF NOT EXISTS programacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_programa VARCHAR(255) NOT NULL,
    descripcion TEXT,
    horario_inicio TIME NOT NULL,
    horario_fin TIME NOT NULL,
    dia_semana ENUM('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
    conductor VARCHAR(100),
    categoria VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    hora VARCHAR(20),
    programa VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS live_stream (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    url_stream VARCHAR(500) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS assistant_social_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plataforma VARCHAR(80) NOT NULL UNIQUE,
    url VARCHAR(1000) NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Las tablas `assistant_faq` y `assistant_social_links` también se crean automáticamente cuando se utiliza el chatbot por primera vez.

## Zoom TV Assistant (chatbot)

El asistente responde mediante reglas de intención y palabras clave, consultando el contenido publicado en MySQL. **No es un modelo de inteligencia artificial entrenado con aprendizaje automático ni genera respuestas libres**: su conocimiento se configura con preguntas frecuentes y se complementa con los datos actuales de las tablas del sitio.

### Cómo está configurado

En `backend/routes/assistant.js` se declaran preguntas semilla (`FAQ_SEEDS`) con una categoría y palabras clave. En la primera consulta al asistente, la API crea `assistant_faq` y `assistant_social_links` si faltan y agrega las preguntas y redes iniciales sin duplicarlas. Después normaliza la pregunta (minúsculas y sin tildes), detecta la intención y consulta los datos correspondientes. Las preguntas y palabras clave activas también se leen desde `assistant_faq`.

La configuración inicial contempla estas preguntas e intenciones:

- **Programación:** «¿Cuál es el horario de programación?» y «¿Qué programas hay hoy?»; puede resolver consultas por día y horario.
- **Anunciantes:** «¿Qué anunciantes están activos?»; también busca datos de un anunciante concreto, como contacto, horario o web.
- **Contacto y Nosotros:** «¿Cómo contacto a Zoom TV?» y «¿Qué es Zoom TV?»; utiliza la información, historia, misión, visión, valores y equipo publicados.
- **Redes sociales:** «¿Cuáles son las redes sociales de Zoom TV?»; entrega todos los enlaces activos o el enlace de una plataforma.
- **En vivo:** «¿Cómo puedo ver Zoom TV en vivo?»; consulta la transmisión activa y entrega su enlace.
- **Noticias:** «¿Qué noticias tienen?», «¿Qué categorías de noticias hay?» y consultas por Actualidad, Deportes, Música, Nacionales o Regionales.
- **Ayuda:** «¿Qué información puede dar Zoom TV Assistant?».

### Datos dinámicos y respuestas con contenido

| Consulta | Fuente consultada | Respuesta del asistente |
| --- | --- | --- |
| Horarios o programa de hoy | `programacion` | Filtra programas activos por día y hora. Para saber qué se transmite ahora, considera la hora de Perú (`America/Lima`). |
| Anunciantes | `anunciantes` | Lista anunciantes activos y muestra los datos disponibles de uno en particular. |
| Información institucional o contacto | `nosotros` | Usa el registro institucional más reciente. |
| Transmisión en vivo | `live_stream` | Usa el live activo más reciente; el frontend puede mostrar la acción «Ver Live» hacia `/live`. |
| Noticias | `noticias` | Busca noticias publicadas por fecha, categoría o relevancia y puede devolver tarjetas con título, resumen, imagen, fuente y enlace a la noticia. |
| Redes sociales | `assistant_social_links` | Muestra únicamente enlaces activos. |

Cuando la respuesta incluye una noticia, la API entrega los datos de la tarjeta estructurados para que el chat muestre su imagen y enlace. El asistente también admite saludos, agradecimientos, ayuda y seguimiento de algunas preguntas usando el historial reciente enviado por el chat. Si la pregunta no coincide con una intención conocida, ofrece orientación sobre los temas que puede consultar.

### Cómo ampliar el conocimiento

1. Añade o ajusta una entrada en `FAQ_SEEDS` en `backend/routes/assistant.js`, indicando pregunta, categoría y sinónimos en palabras clave. Las categorías deben corresponder a las intenciones que procesa la función de respuesta.
2. Verifica que la intención consulte la tabla y los campos correctos en la misma ruta. Para información que cambia (noticias, horarios, anunciantes, datos de Nosotros y live), actualiza el contenido desde el dashboard; el asistente lo consulta directamente en la base de datos.
3. Para redes sociales, modifica las filas de `assistant_social_links`. Para FAQ, se puede consultar el conocimiento activo mediante `GET /api/assistant/knowledge`; las filas activas se usan para detectar preguntas.
4. Reinicia la API después de cambiar el código. Las preguntas iniciales usan inserción sin duplicados; editar el arreglo de semillas no sobrescribe automáticamente una pregunta que ya exista en la base.

El dashboard no incluye actualmente una pantalla para administrar las FAQ del chatbot. Su mantenimiento se hace en el código o directamente en `assistant_faq`; el resto de contenido dinámico se mantiene en sus secciones habituales del dashboard.

La API del chat recibe `POST /api/assistant/chat` con JSON como `{ "message": "¿Qué programas hay hoy?" }`. La URL completa local es `http://localhost:3000/api/assistant/chat`.

### Conexión y configuración

- **Base local:** `zoomtv_db` en MySQL/MariaDB, normalmente en `127.0.0.1:3306`.
- **API local:** `http://localhost:3000/api`; el frontend usa `VITE_API_URL` para encontrarla.
- **Credenciales de MySQL:** se configuran solamente en `backend/.env` mediante `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME=zoomtv_db`.
- **Esquema SQL:** se encuentra en `backend/database/schema.sql` dentro del proyecto del backend. El backend también crea las tablas del chatbot si todavía no existen.

No guardes contraseñas en este repositorio ni en variables `VITE_`: esas variables se incluyen en el código que recibe el navegador.

## 🚀 Características

- **Página de TV moderna** con diseño responsivo
- **Integración con API** para contenido dinámico
- **Sistema de noticias** por categorías (Actualidad, Deportes, Música, Nacionales, Regionales)
- **Programación de TV** con horarios por día
- **Sección de anunciantes** con información comercial
- **Live Stream** integrado
- **Panel de administración** (CMS) para gestión de contenido

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── App.jsx         # Componente principal de la aplicación
│   ├── Header/         # Componente de encabezado
│   │   ├── Header.jsx
│   │   └── Header.css
│   ├── Navbar.jsx      # Componente de navegación
│   ├── Navbar.css
│   ├── Chatbot/        # Chatbot integrado
│   │   ├── Chatbot.jsx
│   │   └── Chatbot.css
│   ├── Loading/        # Componente de carga
│   │   ├── Loading.jsx
│   │   └── Loading.css
│   └── TVFloatingScreens/ # Pantallas flotantes
│       ├── TVFloatingScreens.jsx
│       └── TVFloatingScreens.css
├── pages/              # Páginas de la aplicación
│   ├── Inicio/         # Página de inicio
│   ├── Nosotros/       # Página sobre nosotros
│   ├── Actualidad/     # Sección de noticias
│   │   ├── Actualidad.jsx
│   │   ├── Deportes.jsx
│   │   ├── Musica.jsx
│   │   ├── Nacionales.jsx
│   │   └── Regionales.jsx
│   ├── Programacion/   # Programación de TV
│   │   └── Programacion12.jsx
│   ├── Anunciantes/    # Sección de anunciantes
│   │   └── Anunciantes.jsx
│   ├── Live9/          # Live Stream
│   │   └── Live9.jsx
│   ├── RedesSociales/  # Página de redes sociales
│   │   └── RedesSociales.jsx
│   └── ZoomApp/        # Página de la app
│       └── ZoomApp.jsx
├── services/           # Servicios de API
│   └── api.js         # Servicio de API centralizado
├── hooks/             # Hooks personalizados
│   └── useNewsCategory.js
├── assets/            # Recursos estáticos
│   └── images/        # Imágenes del proyecto
├── main.jsx          # Punto de entrada de la aplicación
└── index.css         # Estilos globales
```

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework principal
- **Vite** - Herramienta de construcción
- **CSS3** - Estilos personalizados
- **Axios** - Cliente HTTP para API
- **React Router** - Navegación entre páginas

## 🌐 Rutas de la Aplicación

- `/` - Página de inicio
- `/nosotros` - Página sobre nosotros
- `/actualidad` - Noticias de actualidad
- `/deportes` - Noticias deportivas
- `/musica` - Noticias de música
- `/nacionales` - Noticias nacionales
- `/regionales` - Noticias regionales
- `/programacion` - Programación de TV
- `/anunciantes` - Sección de anunciantes
- `/live9` - Live Stream
- `/redes-sociales` - Página de redes sociales
- `/zoom-app` - Página de la aplicación

## 🚀 Instalación y Uso

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 📡 Integración con API

El proyecto está integrado con una API REST que proporciona:
- **Noticias** por categorías
- **Programación** de TV
- **Anunciantes** y patrocinadores
- **Live Stream** URLs
- **Información** de la empresa

## 🎨 Diseño

- **Responsive Design** - Adaptable a todos los dispositivos
- **Tema oscuro** - Diseño moderno y elegante
- **Animaciones suaves** - Transiciones fluidas
- **UI/UX optimizada** - Experiencia de usuario mejorada

## 📱 Características Móviles

- **Navegación táctil** - Optimizada para dispositivos móviles
- **Menú hamburguesa** - Navegación compacta
- **Imágenes responsivas** - Carga optimizada
- **Touch gestures** - Gestos táctiles nativos

## 🖼️ Captura de Pantalla

![Zoom TV Canal 10 - Captura de la Web](https://github.com/user-attachments/assets/7f1e5c45-2297-44e7-91f7-99bc1d1a6c06)

## 🔧 Configuración

El proyecto utiliza variables de entorno para configuración:
- **API_URL** - URL base de la API
- **LIVE_STREAM_URL** - URL del live stream
- **ANALYTICS_ID** - ID de Google Analytics

## 📄 Licencia

Este proyecto es propiedad de Zoom TV Canal 10.
