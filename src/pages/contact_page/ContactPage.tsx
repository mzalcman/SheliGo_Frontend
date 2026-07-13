import "./contact_page.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { supabase } from "../../services/supabase"; // 🚀 Tu cliente de Supabase

const ContactPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [motivo, setMotivo] = useState("");
  const [consulta, setConsulta] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !motivo || !consulta) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Guardamos la consulta en tu base de datos de Supabase
      const { error: supabaseError } = await supabase
        .from("soporte_consultas")
        .insert([
          { 
            email: email, 
            motivo: motivo, 
            consulta: consulta 
          }
        ]);

      if (supabaseError) throw supabaseError;

      // 2️⃣ Enviamos los datos directamente a tu correo usando Formspree
      const response = await fetch("https://formspree.io/f/meeyqldp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          motivo: motivo,
          consulta: consulta,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el mail a Formspree");
      }

      // 🎉 Si ambas operaciones salieron bien, confirmamos el éxito
      alert("¡Consulta enviada con éxito! Nos comunicaremos pronto.");
      
      // Limpiamos los campos del formulario
      setEmail("");
      setMotivo("");
      setConsulta("");
      
      // Redirigimos al usuario a la página de ayuda
      navigate("/ayuda");

    } catch (error) {
      console.error("Error completo en el envío:", error);
      alert("Hubo un problema al enviar tu consulta. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact_page">
      <Header />
      
      <header className="contact_header">
        <button className="back_button" onClick={() => navigate(-1)} disabled={loading}>
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="contact_content">
        <h1>Contáctanos</h1>
        <p className="contact_subtitle">
          Cualquier cosa que necesites podes comunicarte con nosotros.
        </p>

        <form onSubmit={handleSendEmail} className="contact_card">
          <div className="input_group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="nombre@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input_group">
            <label>Motivo</label>
            <select 
              value={motivo} 
              onChange={(e) => setMotivo(e.target.value)}
              required
              disabled={loading}
            >
              <option value="" disabled>Seleccione una opción</option>
              <option value="Problema con un Reporte">Problema con un Reporte</option>
              <option value="Soporte de SheliExpress">Soporte de SheliExpress</option>
              <option value="Fallo Técnico en la App">Fallo Técnico en la App</option>
              <option value="Denuncia / Seguridad">Denuncia / Seguridad</option>
              <option value="Otro motivo">Otro motivo</option>
            </select>
          </div>

          <div className="input_group">
            <label>Consulta</label>
            <textarea 
              placeholder="Escribe su mensaje" 
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              rows={5}
              required
              disabled={loading}
            />
          </div>
        </form>

        <div className="button_container">
          <button 
            type="submit" 
            onClick={handleSendEmail} 
            className="send_query_button"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar consulta"} {!loading && <Send size={20} />}
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ContactPage;