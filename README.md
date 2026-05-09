# Escuela Dominical — Backend API v2

API REST Node.js + Express + MongoDB con 3 roles: **Admin**, **Docente** y **Público (niños)**.

---

## Instalación

```bash
npm install
cp .env.example .env   # edita con tus valores
npm run dev
```

Al iniciar se crea automáticamente:
- **Email:** `admin@iglesia.com`  **Contraseña:** `123456`

---

## Variables de entorno (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/escuela-dominical
JWT_SECRET=algo_muy_secreto
FRONTEND_URL=http://localhost:3000

ADMIN_EMAIL=admin@iglesia.com
ADMIN_PASS=123456

GMAIL_USER=tucorreo@gmail.com
GMAIL_PASS=xxxx_xxxx_xxxx_xxxx   # contraseña de aplicación de Google
```

> Para obtener la contraseña de aplicación de Gmail:
> Cuenta Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicación

---

## Estructura

```
backend/
├── server.js
├── config/db.js
├── models/
│   ├── User.js            ← mustChangePassword, resetPasswordToken
│   ├── Class.js
│   ├── Attendance.js
│   ├── Notification.js    ← tipo: global | docente
│   └── WeeklyContent.js   ← tema, versículo, actividad, avisos por semana
├── controllers/
│   ├── authController.js          ← login, perfil, cambio/reset de contraseña
│   ├── userController.js          ← CRUD admin + envío de correo al crear
│   ├── classController.js         ← CRUD clases + asignar estudiantes
│   ├── attendanceController.js    ← asistencia admin
│   ├── docenteController.js       ← asistencia, contenido semanal, avisos
│   ├── notificationController.js  ← notificaciones admin
│   └── publicController.js        ← página pública sin auth
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── classRoutes.js
│   ├── attendanceRoutes.js
│   ├── notificationRoutes.js
│   ├── docenteRoutes.js
│   └── publicRoutes.js
├── middlewares/
│   ├── authMiddleware.js    ← protect + authorize(rol)
│   └── errorHandler.js
└── utils/
    ├── createAdmin.js
    └── emailService.js      ← sendWelcomeEmail + sendPasswordResetEmail
```

---

## Endpoints

### 🌐 Públicos (sin token)

| Método | Ruta                               | Descripción                         |
|--------|------------------------------------|-------------------------------------|
| GET    | /api/public/classes                | Clases activas                      |
| GET    | /api/public/classes/:id/content    | Contenido semanal publicado         |
| GET    | /api/public/notifications          | Avisos globales                     |
| POST   | /api/auth/login                    | Iniciar sesión                      |
| POST   | /api/auth/forgot-password          | Solicitar reset de contraseña       |
| PUT    | /api/auth/reset-password/:token    | Restablecer contraseña              |

### 🔐 Cualquier usuario autenticado

| Método | Ruta                        | Descripción                    |
|--------|-----------------------------|--------------------------------|
| GET    | /api/auth/me                | Perfil propio                  |
| PUT    | /api/auth/profile           | Actualizar nombre/email        |
| PUT    | /api/auth/change-password   | Cambiar contraseña             |

### 👨‍💼 Solo Admin

| Método | Ruta                                      | Descripción                          |
|--------|-------------------------------------------|--------------------------------------|
| GET    | /api/admin/users                          | Listar usuarios (filtros: rol/search)|
| POST   | /api/admin/users                          | Crear usuario → envía correo         |
| PUT    | /api/admin/users/:id                      | Editar usuario                       |
| PUT    | /api/admin/users/:id/reset-password       | Resetear contraseña → envía correo   |
| DELETE | /api/admin/users/:id                      | Eliminar usuario                     |
| GET    | /api/admin/classes                        | Listar clases                        |
| POST   | /api/admin/classes                        | Crear clase                          |
| PUT    | /api/admin/classes/:id                    | Editar clase                         |
| DELETE | /api/admin/classes/:id                    | Eliminar clase                       |
| PUT    | /api/admin/classes/:id/students           | Asignar lista completa de estudiantes|
| POST   | /api/admin/classes/:id/students/:eId      | Agregar un estudiante                |
| DELETE | /api/admin/classes/:id/students/:eId      | Quitar un estudiante                 |
| GET    | /api/admin/attendance                     | Ver registros de asistencia          |
| POST   | /api/admin/attendance/batch               | Registrar asistencia en lote         |
| GET    | /api/admin/attendance/report/:claseId     | Reporte % por clase                  |
| GET    | /api/admin/notifications                  | Ver notificaciones                   |
| POST   | /api/admin/notifications                  | Crear notificación (global/docente)  |
| DELETE | /api/admin/notifications/:id              | Eliminar notificación                |

### 👩‍🏫 Solo Docente

| Método | Ruta                                  | Descripción                        |
|--------|---------------------------------------|------------------------------------|
| GET    | /api/docente/classes                  | Mis clases asignadas               |
| GET    | /api/docente/classes/:id/students     | Estudiantes de mi clase            |
| POST   | /api/docente/attendance/batch         | Registrar asistencia de mi clase   |
| GET    | /api/docente/attendance/:claseId      | Historial de asistencia            |
| GET    | /api/docente/notifications            | Notificaciones del admin           |
| GET    | /api/docente/weekly/:claseId          | Contenido semanal de mi clase      |
| PUT    | /api/docente/weekly/:claseId          | Actualizar tema/versículo/actividad|
| POST   | /api/docente/weekly/:claseId/aviso    | Publicar aviso para el grupo       |

---

## Flujo de creación de usuario

1. Admin crea usuario con nombre, email y rol.
2. El sistema genera una **contraseña temporal** aleatoria.
3. Se envía un **correo de bienvenida** con las credenciales.
4. Al hacer login, `mustChangePassword: true` indica al frontend que debe redirigir al cambio de contraseña.
5. El usuario cambia su contraseña → `mustChangePassword` se pone en `false`.
