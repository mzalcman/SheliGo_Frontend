import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ShieldCheck, RefreshCw, Lock, ArrowLeft, Send } from "lucide-react";
import "./help_page.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import HelpCategoryCard from "../../components/help_category_card/help_category_card";
import FAQAccordionItem from "../../components/faq_accordion_item/faq_accordion_item";
import SupportTeamBanner from "../../components/support_team_banner/support_team_banner";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const HelpPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories = [
    { id: "reportes", title: "Publicaciones y Reportes", desc: "Cómo crear avisos efectivos de objetos perdidos o encontrados.", icon: <AlertCircle size={22} /> },
    { id: "seguridad", title: "Seguridad de la Comunidad", desc: "Protocolos para encuentros seguros y verificación de usuarios.", icon: <ShieldCheck size={22} /> },
    { id: "devoluciones", title: "Envíos y Devoluciones", desc: "Logística de entregas y cómo funciona el servicio de SheliExpress.", icon: <RefreshCw size={22} /> },
    { id: "privacidad", title: "Privacidad de tus Datos", desc: "Cómo protegemos tu dirección, ubicación en el mapa y tus chats.", icon: <Lock size={22} /> },
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "¿Cómo reporto un objeto perdido?",
      answer: "Para reportar un objeto, dirígete a la sección 'Publicar' (+) en el menú principal. Completa el formulario con el nombre del ítem, categoría, fecha, descripción detallada y una foto clara que ayude a su pronta identificación."
    },
    {
      id: 2,
      question: "¿Hay algún costo por recuperar un ítem?",
      answer: "SheliGo es una plataforma comunitaria 100% gratuita. No cobramos por usar el servicio básico. Únicamente si decides utilizar nuestro servicio de mensajería opcional 'SheliExpress' para recibir el objeto en tu puerta, se aplicará una tarifa logística calculada por la distancia."
    },
    {
      id: 3,
      question: "¿Qué pasa si mi objeto aún no aparece?",
      answer: "Te recomendamos mantener las notificaciones encendidas y revisar periódicamente la pestaña de búsquedas. Nuestra base de datos se actualiza en tiempo real y recibirás una alerta inmediata si alguien publica un objeto que coincida con tus palabras clave."
    },
    {
      id: 4,
      question: "¿Cómo verifican la identidad del propietario?",
      answer: "Antes de coordinar un encuentro, SheliGo cuenta con un sistema de validación interno mediante preguntas clave sobre el objeto (características que no se muestran en las fotos públicas, como marcas específicas, contenido interno o números de serie) para garantizar que regrese a su dueño real."
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
              <HelpCategoryCard
                key={cat.id}
                title={cat.title}
                desc={cat.desc}
                icon={cat.icon}
              />
            ))}
          </div>
        </section>

        <section className="help_section">
          <h2 className="section_main_title">Preguntas Frecuentes</h2>
          <p className="section_subtitle">Las respuestas más rápidas a las dudas más comunes de nuestra comunidad.</p>

          <SupportTeamBanner />

          <div className="faqs_accordion">
            {faqs.map((faq) => (
              <FAQAccordionItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === faq.id}
                onToggle={() => toggleFaq(faq.id)}
              />
            ))}
          </div>
        </section>

        <section className="human_contact_banner">
          <h2>¿Preferís hablar con un humano?</h2>
          <p>Nuestro equipo de conserjes digitales está disponible 24/7 para ayudarte a resolver cualquier inconveniente.</p>
          <button 
            className="submit_query_button" 
            onClick={() => navigate("/contactanos")}
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