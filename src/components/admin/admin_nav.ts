import { Building2, FileText, LayoutDashboard, Tags, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminNavItem {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

/* Secciones del backoffice. Todas son visibles para admin e institution_admin;
   lo que cambia dentro de cada una son las acciones permitidas. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { path: "/admin", label: "Dashboard", description: "Resumen de la actividad", icon: LayoutDashboard },
  { path: "/admin/usuarios", label: "Usuarios", description: "Personas registradas y sus roles", icon: Users },
  { path: "/admin/publicaciones", label: "Publicaciones", description: "Moderación de objetos publicados", icon: FileText },
  { path: "/admin/instituciones", label: "Instituciones", description: "Colegios, clubes y organizaciones", icon: Building2 },
  { path: "/admin/categorias", label: "Categorías", description: "Tipos de objeto disponibles", icon: Tags },
];

export const find_admin_nav_item = (pathname: string) =>
  [...ADMIN_NAV_ITEMS].reverse().find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`)) ??
  ADMIN_NAV_ITEMS[0];
