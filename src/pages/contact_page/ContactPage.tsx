import "./contact_page.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, AlertTriangle } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Modal from "../../components/modal/modal"; // Ajusta la ruta a tu componente Modal
import { supabase } from "../../services/supabase";

const ContactPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [motivo, setMotivo] = useState("");
  const [consulta, setConsulta] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para controlar el Modal
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "success" | "error";
    icon: React.ReactNode;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "success",
    icon: null,
    onConfirm: () => {},
  });

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !motivo || !consulta) {
      setModalConfig({
        isOpen: true,
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos del formulario antes de enviar.",
        variant: "error",
        icon: <AlertTriangle size={36} color="#d32f2f" />,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Guardamos la consulta en Supabase
      const { error: supabaseError } = await supabase
        .from("soporte_consultas")
        .insert([{ email, motivo, consulta }]);

      if (supabaseError) throw new Error(`Supabase: ${supabaseError.message}`);

      // 2️⃣ Enviamos los datos a Formspree
      const response = await fetch("https://formspree.io/f/meeyqldp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, motivo, consulta }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar la notificación por correo.");
      }

      // 🎉 Éxito: Mostramos el modal profesional
      setModalConfig({
        isOpen: true,
        title: "¡Consulta enviada con éxito!",
        description:
          "Tu mensaje ha sido registrado correctamente. Nuestro equipo revisará tu solicitud y se pondrá en contacto a la brevedad.",
        variant: "success",
        icon: <CheckCircle size={36} color="#2e7d32" />,
        onConfirm: () => {
          setEmail("");
          setMotivo("");
          setConsulta("");
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          navigate("/ayuda");
        },
      });
    } catch (error: any) {
      console.error("Error en el envío:", error);

      // ❌ Error: Mostramos el modal aclarando el motivo
      setModalConfig({
        isOpen: true,
        title: "Error al enviar la consulta",
        description:
          error?.message ||
          "Ocurrió un problema de conexión al procesar tu solicitud. Por favor, verifica tu conexión e intenta nuevamente.",
        variant: "error",
        icon: <AlertTriangle size={36} color="#d32f2f" />,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact_page">
      <Header />

      <div className="contact_content">
        {/* Header con la flecha y el título pegado al lado */}
        <header className="contact_title_header">
          <button
            className="back_button"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            <ArrowLeft size={28} color="#ff6f00" />
          </button>
          <h1>Contáctanos</h1>
        </header>

        <p className="contact_subtitle">
          Cualquier cosa que necesites podes comunicarte con nosotros.
        </p>

        <form id="contactForm" onSubmit={handleSendEmail} className="contact_card">
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
              <option value="" disabled>
                Seleccione una opción
              </option>
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
            form="contactForm"
            className="send_query_button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span>Enviando consulta...</span>
                <span className="spinner"></span>
              </>
            ) : (
              <>
                <span>Enviar consulta</span>
                <Send size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      <Footer />

      {/* Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        description={modalConfig.description}
        variant={modalConfig.variant}
        icon={modalConfig.icon}
        confirmText="Entendido"
        onConfirm={modalConfig.onConfirm}
      />
    </main>
  );
};

export default ContactPage;