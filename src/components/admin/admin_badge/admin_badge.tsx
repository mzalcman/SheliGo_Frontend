import type { ReactNode } from "react";
import type { UserRole } from "../../../types/user";
import type { AdminPublicationState, AdminPublicationType } from "../../../types/admin/admin_publication";
import { ROLE_LABELS, STATE_LABELS } from "./admin_labels";
import "./admin_badge.css";

type BadgeTone = "primary" | "secondary" | "dark" | "muted" | "outline";

export const AdminBadge = ({ tone = "muted", children }: { tone?: BadgeTone; children: ReactNode }) => (
  <span className={`admin_badge admin_badge_${tone}`}>{children}</span>
);

const ROLE_TONES: Record<UserRole, BadgeTone> = {
  user: "muted",
  institution_admin: "primary",
  admin: "dark",
};

export const AdminRoleBadge = ({ rol }: { rol: UserRole }) => (
  <AdminBadge tone={ROLE_TONES[rol] ?? "muted"}>{ROLE_LABELS[rol] ?? rol}</AdminBadge>
);

const STATE_TONES: Record<AdminPublicationState, BadgeTone> = {
  activa: "primary",
  recuperada: "secondary",
  eliminada: "muted",
};

export const AdminStateBadge = ({ estado }: { estado: AdminPublicationState }) => (
  <AdminBadge tone={STATE_TONES[estado] ?? "muted"}>{STATE_LABELS[estado] ?? estado}</AdminBadge>
);

export const AdminTypeBadge = ({ tipo }: { tipo: AdminPublicationType }) => (
  <AdminBadge tone="outline">{tipo === "encontrado" ? "Encontrado" : "Perdido"}</AdminBadge>
);
