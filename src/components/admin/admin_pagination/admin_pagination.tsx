import { ChevronLeft, ChevronRight } from "lucide-react";
import "./admin_pagination.css";

interface AdminPaginationProps {
  page: number;
  total_pages: number;
  total: number;
  limit: number;
  on_change: (page: number) => void;
  disabled?: boolean;
}

// Páginas visibles: primera, última y las vecinas de la actual
const visible_pages = (page: number, total_pages: number): (number | "gap")[] => {
  const pages = new Set([1, total_pages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total_pages).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && p - previous > 1) result.push("gap");
    result.push(p);
  });
  return result;
};

const AdminPagination = ({ page, total_pages, total, limit, on_change, disabled = false }: AdminPaginationProps) => {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="admin_pagination" aria-label="Paginación">
      <span className="admin_pagination_summary">
        {from}–{to} de {total}
      </span>

      {total_pages > 1 && (
        <div className="admin_pagination_controls">
          <button
            className="icon_button admin_pagination_button"
            onClick={() => on_change(page - 1)}
            disabled={disabled || page <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>
          {visible_pages(page, total_pages).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="admin_pagination_gap">…</span>
            ) : (
              <button
                key={item}
                className={`admin_pagination_page ${item === page ? "is_current" : ""}`}
                onClick={() => on_change(item)}
                disabled={disabled}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </button>
            )
          )}
          <button
            className="icon_button admin_pagination_button"
            onClick={() => on_change(page + 1)}
            disabled={disabled || page >= total_pages}
            aria-label="Página siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </nav>
  );
};

export default AdminPagination;
