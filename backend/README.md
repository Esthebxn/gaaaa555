# API ZoomTV - Node.js + MySQL

API REST simple para la gestión de contenido de ZoomTV con operaciones CRUD básicas.

## Requisitos

- Node.js (versión 14 o superior)
- MySQL (XAMPP recomendado)
- npm o yarn

## Instalación

1. **Instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar base de datos:**
   - Asegúrate de que XAMPP esté ejecutándose
   - Abre phpMyAdmin (http://localhost/phpmyadmin)
   - Ejecuta el script SQL que está en `database/schema.sql`
   - Esto creará la base de datos `zoomtv_db` y las tablas necesarias

3. **Configurar conexión a la base de datos:**
   - Edita el archivo `server.js` si necesitas cambiar la configuración de la base de datos:
   ```javascript
   const dbConfig = {
     host: 'localhost',
     user: 'root',
     password: '', // Tu contraseña de MySQL
     database: 'zoomtv_db',
     port: 3306
   };
   ```

4. **Ejecutar el servidor:**
   ```bash
   npm start
   # o para desarrollo con auto-reload:
   npm run dev
   ```

El servidor estará disponible en: `http://localhost:3000`

## Endpoints de la API

### Nosotros
- `GET /api/nosotros` - Obtener información de nosotros
- `GET /api/nosotros/all` - Obtener todos los registros
- `GET /api/nosotros/:id` - Obtener por ID
- `POST /api/nosotros` - Crear nuevo registro
- `PUT /api/nosotros/:id` - Actualizar registro
- `DELETE /api/nosotros/:id` - Eliminar registro

### Noticias
- `GET /api/noticias` - Obtener todas las noticias
- `GET /api/noticias/:id` - Obtener noticia por ID
- `GET /api/noticias/destacadas/list` - Obtener noticias destacadas
- `POST /api/noticias` - Crear nueva noticia
- `PUT /api/noticias/:id` - Actualizar noticia
- `DELETE /api/noticias/:id` - Eliminar noticia

**Filtros para noticias:**
- `?categoria=Nacionales` - Filtrar por categoría
- `?destacada=true` - Solo noticias destacadas
- `?activa=true` - Solo noticias activas

### Programación
- `GET /api/programacion` - Obtener toda la programación
- `GET /api/programacion/:id` - Obtener programa por ID
- `GET /api/programacion/dia/:dia` - Obtener programación por día
- `GET /api/programacion/semana/actual` - Obtener programación de la semana
- `POST /api/programacion` - Crear nuevo programa
- `PUT /api/programacion/:id` - Actualizar programa
- `DELETE /api/programacion/:id` - Eliminar programa

**Filtros para programación:**
- `?dia_semana=Lunes` - Filtrar por día
- `?categoria=Noticias` - Filtrar por categoría
- `?activo=true` - Solo programas activos

### Anunciantes
- `GET /api/anunciantes` - Obtener todos los anunciantes
- `GET /api/anunciantes/:id` - Obtener anunciante por ID
- `GET /api/anunciantes/activos/list` - Obtener anunciantes activos
- `POST /api/anunciantes` - Crear nuevo anunciante
- `PUT /api/anunciantes/:id` - Actualizar anunciante
- `DELETE /api/anunciantes/:id` - Eliminar anunciante

**Filtros para anunciantes:**
- `?activo=true` - Solo anunciantes activos

## Ejemplos de uso

### Crear una noticia
```bash
curl -X POST http://localhost:3000/api/noticias \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Nueva noticia de prueba",
    "contenido": "Contenido completo de la noticia...",
    "resumen": "Resumen de la noticia",
    "categoria": "Nacionales",
    "autor": "Reportero",
    "destacada": true
  }'
```

### Obtener noticias destacadas
```bash
curl http://localhost:3000/api/noticias/destacadas/list
```

### Crear un programa
```bash
curl -X POST http://localhost:3000/api/programacion \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_programa": "Noticiero Nocturno",
    "descripcion": "Noticias del día",
    "horario_inicio": "22:00:00",
    "horario_fin": "23:00:00",
    "dia_semana": "Lunes",
    "conductor": "María García",
    "categoria": "Noticias"
  }'
```

## Estructura de la base de datos

- **nosotros**: Información de la empresa
- **noticias**: Noticias y artículos
- **programacion**: Programas de TV
- **anunciantes**: Empresas anunciantes

## Notas

- Esta API no incluye autenticación ni seguridad
- Todos los endpoints aceptan CORS
- Los datos se almacenan en MySQL
- Incluye datos de ejemplo para pruebas
