import "./question_input.css";
import { Send } from "lucide-react";

interface QuestionInputProps {
  value: string;
  on_change: (value: string) => void;
  on_submit: () => void;
  placeholder?: string;
  // Mientras se envía: evita publicar dos veces
  disabled?: boolean;
}

// Mismo máximo que el backend (preguntas-schema)
const MAX_CARACTERES = 2000;

const QuestionInput = ({
  value,
  on_change,
  on_submit,
  placeholder = "Escribe aquí...",
  disabled = false,
}: QuestionInputProps) => {

  return (
    <div className="question_input_container">
      <textarea
        value={value}
        placeholder={placeholder}
        className="question_input"
        maxLength={MAX_CARACTERES}
        disabled={disabled}
        onChange={(event) => on_change(event.target.value)}
      />

      <div className="question_input_footer">
        <button
          className="btn btn_primary btn_sm"
          onClick={on_submit}
          disabled={disabled || !value.trim()}
        >
          {disabled ? "Publicando..." : "Publicar"}
          <Send size={15} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};

export default QuestionInput;
