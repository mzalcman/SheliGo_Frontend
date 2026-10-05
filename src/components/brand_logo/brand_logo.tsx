import "./brand_logo.css";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  tone?: "dark" | "light";
  show_wordmark?: boolean;
}

/* Logo de SheliGo: isotipo + wordmark. Componente puramente visual. */
const BrandLogo = ({
  size = "md",
  tone = "dark",
  show_wordmark = true,
}: BrandLogoProps) => {
  return (
    <span className={`brand_logo brand_logo_${size} brand_logo_${tone}`}>
      <img
        src="/logo_sheligo.png"
        alt={show_wordmark ? "" : "SheliGo"}
        className="brand_logo_mark"
      />
      {show_wordmark && (
        <span className="brand_logo_wordmark">
          Sheli<span>Go</span>
        </span>
      )}
    </span>
  );
};

export default BrandLogo;
