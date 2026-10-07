import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AdminSessionContext } from "../../../contexts/admin_session_context";
import AdminToast from "../admin_toast/admin_toast";
import type { AdminToastItem, AdminToastTone } from "../admin_toast/admin_toast";
import type { AdminSession } from "../../../types/admin/admin_session";

const AdminSessionProvider = ({ session, children }: { session: AdminSession; children: ReactNode }) => {
  const [toasts, set_toasts] = useState<AdminToastItem[]>([]);
  const next_id = useRef(0);

  const dismiss = useCallback((id: number) => {
    set_toasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: AdminToastTone = "success") => {
      const id = ++next_id.current;
      set_toasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ session, notify }), [session, notify]);

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
      <AdminToast toasts={toasts} on_dismiss={dismiss} />
    </AdminSessionContext.Provider>
  );
};

export default AdminSessionProvider;
