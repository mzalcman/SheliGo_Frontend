# SheliGo — Frontend

> "Porque lo tuyo vuelve."

Aplicación web de SheliGo para publicar y encontrar objetos perdidos dentro de instituciones (colegios, universidades, clubes), con un **backoffice** para administradores.

## Tecnologías

- React 19 + TypeScript + Vite
- React Router 7
- Axios (`src/services/api.ts`: agrega el JWT y redirige a `/login` ante un 401)
- React Hook Form
- Supabase JS (login con Google y chat en tiempo real)
- lucide-react (íconos)
- CSS propio con design tokens (`src/styles/tokens.css`)

## Instalación

```bash
npm install
```

Crear `.env.local` en la raíz:

```
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

```bash
npm run dev      # desarrollo (http://localhost:5173)
npm run build    # typecheck + build de producción
npm run lint
```

## Estructura

```
src/
  components/        Componentes reutilizables (cada uno con su .css)
    admin/           Componentes del backoffice
  contexts/          AuthContext y contexto de sesión del backoffice
  hooks/             use_auth, use_admin_session, use_admin_list, use_admin_detail...
  pages/             Una carpeta por pantalla
    admin/           Pantallas del backoffice
  services/          Llamadas a la API (admin/ para el backoffice)
  styles/            tokens.css, admin.css y estilos compartidos
  types/             Tipos de dominio (admin/ para el backoffice)
  utils/
```

Convención de nombres: archivos y carpetas en minúscula con `_` (`admin_users_page.tsx`, `admin_users_service.ts`).

## Diseño

Paleta oficial (definida en `src/styles/tokens.css`): `#FF6F00`, `#FFC107`, `#EAE8E8`, `#717171`, `#FFFFFF`, `#D9D9D9`, `#000000`. El rojo (`--color-danger`) se usa solo para errores y acciones destructivas.

Primitivas globales en `src/index.css`: `.btn` (`_primary`, `_secondary`, `_ghost`, `_danger`, `_sm`, `_block`), `.form_field`, `.form_input`, `.form_select`, `.form_textarea`, `.field_error`, `.form_alert`, `.icon_button`, `.spinner`.

---

## Backoffice (`/admin`)

Panel para administrar SheliGo. Escritorio primero, con sidebar contraíble; en móvil el menú es desplegable y las tablas se muestran como tarjetas.

| Ruta | Pantalla |
|---|---|
| `/admin` | Dashboard: indicadores, publicaciones de los últimos 14 días, instituciones más activas y actividad del equipo |
| `/admin/usuarios` | Usuarios: búsqueda, filtros por rol e institución, detalle, cambio de rol y membresías |
| `/admin/publicaciones` | Moderación: filtros por estado, tipo, institución y categoría; marcar recuperada, eliminar (baja lógica) y restaurar |
| `/admin/instituciones` | Alta, edición con foto, detalle y baja |
| `/admin/categorias` | Alta, edición y baja |

### Acceso y seguridad

- El acceso **no** se decide con el rol guardado en el frontend. `AdminRoute` (`src/components/admin/admin_route`) consulta `GET /admin/me`; si el backend responde 403 se muestra la pantalla de acceso denegado y no se renderiza ningún dato.
- Cada endpoint `/admin` vuelve a validar el permiso en el backend. Los `permisos` de `/admin/me` solo sirven para ocultar botones que darían 403.
- El link "Backoffice" del menú aparece solo para `admin` e `institution_admin`. El menú refresca el usuario con `/usuarios/me` para que las sesiones viejas obtengan su rol.
- El frontend nunca consulta tablas administrativas de Supabase: todo pasa por la API.

Roles:

- `admin`: administrador general de toda la plataforma.
- `institution_admin`: ve y modera solo sus instituciones; categorías en solo lectura; no gestiona roles.
- `user`: sin acceso.

El primer `admin` se asigna en la base (ver el README del backend).

### Comportamiento

- Paginación, búsqueda y filtros resueltos por el servidor (`?page&limit&search`). La búsqueda espera a que se deje de escribir (debounce).
- Cada pantalla maneja carga, vacío, error (con reintentar) y éxito (avisos tipo toast).
- Toda acción destructiva o sensible (eliminar, restaurar, cambiar rol) pide confirmación en un modal y muestra el error del backend si falla (por ejemplo, el 409 al eliminar una categoría en uso).
- Los motivos de moderación quedan en la auditoría del backend.

### Archivos principales

```
components/admin/   admin_route, admin_layout, admin_sidebar, admin_header, admin_table,
                    admin_search, admin_filters, admin_pagination, admin_modal,
                    admin_confirm_modal, admin_badge, admin_stat_card, admin_toast, admin_states
hooks/              use_admin_session, use_admin_list, use_admin_detail, use_admin_options
services/admin/     admin_session, admin_dashboard, admin_users, admin_publications,
                    admin_institutions, admin_categories, admin_options, admin_error
types/admin/        admin_session, admin_dashboard, admin_user, admin_publication,
                    admin_institution, admin_category, admin_pagination
pages/admin/        admin_dashboard_page, admin_users_page, admin_publications_page,
                    admin_institutions_page, admin_categories_page, admin_forbidden_page
```
