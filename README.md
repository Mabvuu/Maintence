# Maintenance Dispatch System

A full-stack maintenance dispatch portal built with Django REST Framework and Next.js.

This project allows residents to submit maintenance requests, property managers to assign those requests to maintenance staff, and maintenance staff to update the progress of assigned work.

The system uses Django session authentication, CSRF protection, and backend-enforced role-based access control.

## Live Demo

Frontend:

Add deployed frontend link here

Backend API:

Add deployed backend link here

## GitHub Repository

[https://github.com/Mabvuu/Maintence](https://github.com/Mabvuu/Maintence)

## Tech Stack

### Backend

* Django
* Django REST Framework
* Django Session Authentication
* CSRF protection
* SQLite for local development

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Fetch API

## Features

* Session-based login and logout
* CSRF-protected API requests
* Role-based dashboards
* Resident request creation
* Manager request assignment
* Staff status updates
* Responsive frontend UI
* Backend permission checks for all protected actions

## User Roles

### Resident

Residents can create maintenance requests and view the status of their own requests.

Residents cannot view other residents' requests, assign tasks, or update request status.

### Property Manager

Property managers can view all maintenance requests and assign requests to maintenance staff.

Managers are the only users allowed to assign requests.

### Maintenance Staff

Maintenance staff can only view requests assigned to them.

They can update the status of their assigned tasks, but they cannot reassign tasks or view tasks assigned to other staff members.

## Access Control

Access control is enforced on the backend using Django REST Framework permissions and queryset filtering.

The frontend changes what users see based on their role, but the backend is still the source of truth for security.

Request visibility is filtered by role:

* Managers can access all maintenance requests.
* Staff can only access requests assigned to them.
* Residents can only access requests they created.

Update permissions are also restricted:

* Residents cannot update requests.
* Staff can only update request status.
* Managers can assign requests to staff.
* Staff assignment only accepts users with the maintenance staff role.

This prevents users from bypassing the frontend and accessing or modifying unauthorized records directly through the API.

## Authentication and CSRF

The project uses Django session-based authentication.

The frontend sends API requests with credentials included so that Django session cookies are sent with each protected request.

Before unsafe requests such as login, logout, creating a request, assigning a request, or updating a status, the frontend first requests a CSRF token from the backend.

The CSRF token is then sent with the request using the `X-CSRFToken` header.

This keeps the cookie-based authentication flow protected while still allowing the Next.js frontend to communicate with the Django backend.

## Main API Endpoints

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/api/csrf/`                | Get CSRF token                       |
| POST   | `/api/login/`               | Login user                           |
| POST   | `/api/logout/`              | Logout user                          |
| GET    | `/api/me/`                  | Get current authenticated user       |
| GET    | `/api/requests/`            | Get requests based on user role      |
| POST   | `/api/requests/`            | Resident creates a request           |
| PATCH  | `/api/requests/:id/`        | Staff updates request status         |
| PATCH  | `/api/requests/:id/assign/` | Manager assigns request to staff     |
| GET    | `/api/staff-users/`         | Manager gets maintenance staff users |

## Local Setup

### Clone the Repository

```bash
git clone https://github.com/Mabvuu/Maintence.git
cd Maintence
```

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs on:

```txt
http://localhost:8000
```

### Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

## Test Accounts

Create users in Django admin:

```txt
http://localhost:8000/admin
```

Create at least three users and assign their roles:

| Username | Role     |
| -------- | -------- |
| manager  | manager  |
| staff    | staff    |
| resident | resident |

Each user must have the correct role selected in the custom user model.

## Testing Workflow

1. Login as a resident.
2. Create a maintenance request.
3. Logout.
4. Login as a manager.
5. Assign the request to a staff user.
6. Logout.
7. Login as staff.
8. Update the assigned request status to `In Progress` or `Completed`.
9. Login as resident again and confirm the updated status is visible.

## Project Structure

```txt
maintenance-system/
├── backend/
│   ├── config/
│   ├── maintenance/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   └── admin.py
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   └── page.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── package.json
│   └── tailwind.config.ts
│
└── README.md
```

## Security Notes

This project does not rely on frontend-only role checks.

All sensitive access rules are handled by the backend:

* Residents are blocked from viewing or editing requests they did not create.
* Staff are blocked from viewing tasks assigned to other staff members.
* Staff cannot reassign requests.
* Managers control staff assignment.
* CSRF protection is used for unsafe cookie-authenticated requests.

## Deployment Notes

For production deployment, the following should be updated:

* Set `DEBUG=False`
* Use a secure production `SECRET_KEY`
* Configure production `ALLOWED_HOSTS`
* Configure production `CSRF_TRUSTED_ORIGINS`
* Use HTTPS
* Enable secure cookie settings
* Use a production database such as PostgreSQL
* Set the frontend API base URL to the deployed backend URL

## Assessment Summary

This project was built as a full-stack developer technical assessment focused on Django, Django REST Framework, Next.js, session authentication, CSRF handling, role-based access control, and clean frontend API consumption.
