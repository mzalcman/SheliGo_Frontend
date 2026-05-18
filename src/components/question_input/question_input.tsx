import "./question_input.css";

interface QuestionInputProps {
  value: string;
  on_change: ( value: string ) => void; on_submit: () => void;}

const QuestionInput = ({value,on_change,on_submit,}: QuestionInputProps) => {

  return (

    <div className="question_input_container">

      <textarea
        value={value}
        placeholder="Hacer una pregunta..."
        className="question_input"
        onChange={(event) =>on_change(event.target.value)} />

      <button
        className="question_send_button" onClick={on_submit}>
        Publicar
      </button>
    </div>
  );
};
export default QuestionInput;