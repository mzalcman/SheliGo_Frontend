import "./bottom_filter_modal.css";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface BottomFilterModalProps {
  open: boolean;
  title: string;

  items?: any[];
  selected?: string[];
  onChange?: (values: string[]) => void;

  children?: React.ReactNode;

  onApply?: () => void;
  onClear?: () => void;

  onClose: () => void;
}

const BottomFilterModal = ({
  open,
  title,
  items,
  selected = [],
  onChange,
  children,
  onApply,
  onClear,
  onClose,
}: BottomFilterModalProps) => {
  const [search, setSearch] = useState("");
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  const isListMode = !!items;

  useEffect(() => {
    if (open && isListMode) {
      setTempSelected(selected);
      setSearch("");
    }
  }, [open, selected, isListMode]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item: any) =>
      item.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const toggleItem = (id: string) => {
    if (tempSelected.includes(id)) {
      setTempSelected(tempSelected.filter((v) => v !== id));
      return;
    }

    if (tempSelected.length >= 5) return;

    setTempSelected([...tempSelected, id]);
  };

  if (!open) return null;

  return (
    <>
      <div className="bottom_filter_overlay" onClick={onClose} />

      <div className="bottom_filter_modal">
        <div className="bottom_filter_handle" />

        <div className="bottom_filter_header">
          <h2>{title}</h2>

          <button className="bottom_filter_close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {isListMode && (
          <div className="bottom_filter_search">
            <Search size={18} />
            <input
              placeholder={`Buscar ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        <div className="bottom_filter_list">
          {isListMode &&
            filteredItems.map((item: any) => (
              <label key={item.id} className="bottom_filter_option">
                <input
                  type="checkbox"
                  checked={tempSelected.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                />
                <span>{item.nombre}</span>
              </label>
            ))}

          {!isListMode && children}
        </div>

        <div className="bottom_filter_footer">
          <button
            className="bottom_filter_clear"
            onClick={() => {
              if (isListMode) {
                setTempSelected([]);
                onChange?.([]);
              } else {
                onClear?.();
              }
            }}
          >
            Borrar todo
          </button>

          <button
            className="bottom_filter_apply"
            onClick={() => {
              if (isListMode) {
                onChange?.(tempSelected);
              } else {
                onApply?.();
              }
              onClose();
            }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomFilterModal;