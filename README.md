# Mi CRM Pipedrive

CRM interno inspirado en Pipedrive.

## Stack

- Backend: Django, Django REST Framework, SQLite, django-cors-headers, SimpleJWT.
- Frontend: React, Vite, TailwindCSS, React Router, Axios, @dnd-kit, lucide-react, Recharts, react-big-calendar y date-fns.

## Backend

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

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173/`.

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
