import "./question_input.css";

interface QuestionInputProps {
  value: string;
  on_change: (value: string) => void; 
  on_submit: () => void;
  placeholder?: string;
}

const QuestionInput = ({
  value,
  on_change,
  on_submit,
  placeholder = "Escribe aquí...",
}: QuestionInputProps) => {

  return (
    <div className="question_input_container">
      <textarea
        value={value}
        placeholder={placeholder} 
        className="question_input"
        onChange={(event) => on_change(event.target.value)} 
      />

      <button
        className="question_send_button" 
        onClick={on_submit}
      >
        Publicar
      </button>
    </div>
  );
};

export default QuestionInput;