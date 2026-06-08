import "./search_input.css";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = ({
  value,
  onChange,
}: SearchInputProps) => {

  return (
    <div className="search_input_container">

      <Search
        size={18}
        className="search_icon"/>

      <input
        type="text"
        placeholder="¿Qué estás buscando?"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="search_input"
      />

    </div>
  );
};

export default SearchInput;