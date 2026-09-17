# Mi CRM Pipedrive

CRM interno inspirado en Pipedrive.

## Stack

- Backend: Django, Django REST Framework, SQLite, django-cors-headers, SimpleJWT.
- Frontend: React, Vite, TailwindCSS, React Router, Axios, @dnd-kit, lucide-react, Recharts, react-big-calendar y date-fns.

## Backend local

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe manage.py migrate
.venv\Scripts\python.exe manage.py createsuperuser
.venv\Scripts\python.exe manage.py runserver
```

La API queda disponible en `http://localhost:8000/api/`.

Autenticación JWT:

- `POST /api/token/` con `username` y `password`.
- `POST /api/token/refresh/` con `refresh`.

Durante desarrollo CORS está abierto con `CORS_ALLOW_ALL_ORIGINS = True`.

Variables de entorno disponibles en `backend/.env.example`:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL`
- `SECURE_SSL_REDIRECT`
- `SESSION_COOKIE_SECURE`
- `CSRF_COOKIE_SECURE`
- `SECURE_HSTS_SECONDS`
- `EMAIL_*`

## Frontend local

```powershell
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173/`.

Para producción o pruebas contra otro backend, crea `frontend/.env`:

```env
VITE_API_URL=https://tu-backend.onrender.com/api/
```

## Despliegue

### Backend en Render

1. Crea una PostgreSQL Database en Render o usa `render.yaml`.
2. Crea un Web Service apuntando al repo.
3. Usa `backend` como root directory.
4. Build command:

```bash
./build.sh
```

5. Start command:

```bash
gunicorn backend.wsgi:application
```

6. Configura variables:

```env
SECRET_KEY=valor-seguro
DEBUG=False
ALLOWED_HOSTS=tu-servicio.onrender.com
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://tu-servicio.onrender.com,https://tu-frontend.vercel.app
DATABASE_URL=postgresql://...
```

### Frontend en Vercel

1. Importa el repo en Vercel.
2. Usa `frontend` como root directory.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Configura la variable:

```env
VITE_API_URL=https://tu-servicio.onrender.com/api/
```

6. Deploy.

`frontend/vercel.json` incluye la reescritura a `index.html` para que React Router funcione al refrescar rutas internas.

## Validación

```powershell
cd backend
.venv\Scripts\python.exe manage.py check
.venv\Scripts\python.exe manage.py test

cd ..\frontend
npm run lint
npm run build
```

## Módulos

- Tratos: Kanban con drag & drop y modal para añadir trato con productos.
- Prospectos: tabla filtrable y modal de alta.
- Contactos: personas y organizaciones.
- Actividades: calendario con placeholder de sincronización Google/Outlook.
- Productos: catálogo y CRUD API.
- Avances: métricas y gráficos desde la API.

## Capturas

Agrega aquí capturas cuando el despliegue esté publicado:

- Login: `docs/screenshots/login.png`
- Kanban de tratos: `docs/screenshots/deals-kanban.png`
- Prospectos: `docs/screenshots/prospects.png`
- Dashboard: `docs/screenshots/dashboard.png`
