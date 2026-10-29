# ZoomTV en desarrollo local

## Requisitos

- Node.js y npm.
- MariaDB/MySQL ejecutándose en el puerto `3306`.
- Base de datos `zoomtv_db` configurada en `backend/.env`.

## Iniciar todo

Desde la carpeta raíz del repositorio:

```powershell
npm.cmd run dev
```

Esto inicia la API, la web pública y el dashboard. Mantén esa terminal abierta; para detenerlos, presiona `Ctrl+C`.

| Servicio | Dirección |
| --- | --- |
| Web pública | http://localhost:3002 |
| Dashboard CMS | http://localhost:3005 |
| API | http://localhost:3000 |
| Estado de API y base de datos | http://localhost:3000/api/health |

## Configuración de base de datos

Completa `backend/.env` con los datos de tu instalación local. Debe incluir `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`. El archivo `.env` no se publica en Git.

Si acabas de clonar el proyecto, instala las dependencias una vez:

```powershell
npm --prefix backend install
npm --prefix Zoomtv2.0respaldo install
npm --prefix mysql_cms install
```

Si un puerto ya está ocupado, el script conserva el servicio que ya está corriendo y evita abrir una instancia duplicada. Si ese puerto pertenece a otra aplicación, ciérrala y vuelve a ejecutar `npm run dev`.

También puedes iniciar un servicio por separado con `npm.cmd run dev:api`, `npm.cmd run dev:web` o `npm.cmd run dev:cms`.
