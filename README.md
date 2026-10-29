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