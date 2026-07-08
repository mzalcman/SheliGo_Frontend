import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ShieldCheck, RefreshCw, Lock, ChevronDown, ChevronUp, ArrowLeft, Send } from "lucide-react";
import "./help_page.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const HelpPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories = [
    { id: "reportes", title: "Reportes", desc: "Seguimiento de objetos perdidos y encontrados en tiempo real.", icon: <AlertCircle size={22} className="cat_icon_reportes" /> },
    { id: "seguridad", title: "Seguridad", desc: "Tu integridad y la de tus pertenencias es nuestra prioridad.", icon: <ShieldCheck size={22} className="cat_icon_seguridad" /> },
    { id: "devoluciones", title: "Devoluciones", desc: "Procesos de entrega y logística de recuperación.", icon: <RefreshCw size={22} className="cat_icon_devoluciones" /> },
    { id: "privacidad", title: "Privacidad", desc: "Cómo protegemos tus datos personales y ubicación.", icon: <Lock size={22} className="cat_icon_privacidad" /> },
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "¿Cómo reporto un objeto perdido?",
      answer: "Para reportar un objeto, dirígete a la sección 'Publicar' en el menú inferior. Completa el formulario con el nombre del objeto, categoría, fecha, descripción detallada e imágenes que ayuden a su identificación."
    },
    {
      id: 2,
      question: "¿Hay algún costo por recuperar un ítem?",
      answer: "SheliGo es una plataforma de comunidad. No cobramos por el uso del servicio básico. Sin embargo, si utilizas nuestro servicio de mensajería SheliExpress para que te lleven el objeto a tu puerta, se aplicará una tarifa de logística calculada por la distancia."
    },
    {
      id: 3,
      question: "¿Qué pasa si mi objeto no aparece?",
      answer: "Te recomendamos mantener las notificaciones encendidas y revisar periódicamente la pestaña 'Buscar'. Nuestra comunidad se actualiza constantemente y recibirás una alerta si alguien publica un objeto que coincida con tus criterios."
    },
    {
      id: 4,
      question: "¿Cómo verifican al propietario?",
      answer: "Antes de concretar una devolución, SheliGo cuenta con un sistema de validación interna a través de preguntas clave sobre el objeto (características que no se muestran en las fotos públicas) para garantizar que el ítem regrese a su dueño real."
    }
  ];

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <main className="help_page">
      <Header />

      <header className="help_header">
        <button className="back_button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>¿Cómo podemos ayudarte?</h1>
      </header>

      <div className="help_content">
        <section className="help_section">
          <h2 className="section_main_title">Explora por categorías</h2>
          <div className="categories_grid">
            {categories.map((cat) => (
              <div key={cat.id} className="category_card">
                <div className="category_icon_wrapper">{cat.icon}</div>
                <div className="category_info">
                  <h3>{cat.title}</h3>
                  <p>{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="help_section">
          <h2 className="section_main_title">Preguntas Frecuentes</h2>
          <p className="section_subtitle">Las respuestas más rápidas a las dudas más comunes de nuestra comunidad.</p>

          <div className="support_team_pill">
            <div className="avatar_group">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Soporte 1" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Soporte 2" />
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" alt="Soporte 3" />
            </div>
            <div className="support_team_text">
              <h4>¿No encontrás lo que buscás?</h4>
              <p>Nuestro equipo de soporte está en línea ahora mismo.</p>
            </div>
          </div>

          <div className="faqs_accordion">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className={`faq_item ${isOpen ? "open" : ""}`}>
                  <button className="faq_trigger" onClick={() => toggleFaq(faq.id)}>
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <div className="faq_answer_wrapper">
                    <div className="faq_answer_content">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="human_contact_banner">
          <h2>¿Preferís hablar con un humano?</h2>
          <p>Nuestro equipo de conserjes digitales está disponible 24/7 para ayudarte a resolver cualquier inconveniente.</p>
          <button 
            className="submit_query_button" 
            onClick={() => navigate("/enviar-consulta")}
          >
            Enviar consulta <Send size={18} style={{ marginLeft: '8px', display: 'inline' }} />
          </button>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default HelpPage;