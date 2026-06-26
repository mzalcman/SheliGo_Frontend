import "./bottom_filter_modal.css";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface BottomFilterModalProps {
    open: boolean;
    title: string;
    items: any[];
    selected: string[];
    onChange: (values: string[]) => void;
    onClose: () => void;
}
const BottomFilterModal = ({
    open,
    title,
    items,
    selected,
    onChange,
    onClose,
}: BottomFilterModalProps) => {
    const [search, setSearch] = useState("");
    const [tempSelected, setTempSelected] = useState<string[]>([]);

    useEffect(() => {

        if (open) {
            setTempSelected(selected);
            setSearch("");
        }
    }, [open, selected]);

    const filteredItems = useMemo(() => {
        return items.filter((item: any) =>
            item.nombre
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );
    }, [items, search]);

    const toggleItem = (
        id: string
    ) => {
        if (
            tempSelected.includes(id)
        ) {
            setTempSelected(
                tempSelected.filter(
                    value => value !== id
                )
            );
            return;
        }
        if (
            tempSelected.length >= 5
        ) {
            return;
        }
        setTempSelected([
            ...tempSelected,
            id,
        ]);
    };
    if (!open) {
        return null;
    }
    return (
        <>
            <div
                className="bottom_filter_overlay"
                onClick={onClose}
            />
            <div className="bottom_filter_modal">
                <div className="bottom_filter_handle" />
                <div className="bottom_filter_header">
                    <h2>
                        {title}
                    </h2>
                    <button
                        className="bottom_filter_close"
                        onClick={onClose}
                    >
                        <X size={22} />
                    </button>
                </div>
                <div className="bottom_filter_search">
                    <Search size={18} />
                    <input
                        placeholder={`Buscar ${title.toLowerCase()}...`}
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />
                </div>
                <div className="bottom_filter_list">

                    {filteredItems.map((item: any) => (

                        <label
                            key={item.id}
                            className="bottom_filter_option"
                        >

                            <input
                                type="checkbox"
                                checked={tempSelected.includes(item.id)}
                                onChange={() => toggleItem(item.id)}
                            />

                            <span>
                                {item.nombre}
                            </span>

                        </label>

                    ))}

                </div>
                <div className="bottom_filter_footer">
                    <button
                        className="bottom_filter_clear"
                        onClick={() =>
                            setTempSelected([])
                        }
                    >
                        Borrar todo
                    </button>
                    <button
                        className="bottom_filter_apply"
                        onClick={() => {
                            onChange(
                                tempSelected
                            );
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