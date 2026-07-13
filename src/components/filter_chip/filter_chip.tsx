import "./filter_chip.css";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

const FilterChip = ({
  label,
  active,
  onClick,
}: FilterChipProps) => {

  return (
    <button
      className={
        active
          ? "filter_chip active"
          : "filter_chip"
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default FilterChip;