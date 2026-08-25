import type { Metadata } from "next"
import { PublicLayout } from "@/components/layout/PublicLayout"

export const metadata: Metadata = {
  title: "Política de Privacidad | ACARO OBC",
  description:
    "Conoce cómo la Asociación Café Robusta OBC recopila, usa y protege tu información personal.",
  openGraph: {
    title: "Política de Privacidad | ACARO OBC",
    description:
      "Información sobre el tratamiento de datos personales en el portal de ACARO OBC.",
    url: "https://acaro.org/privacidad",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/landing-hero-v2.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

const lastUpdated = "25 de agosto de 2026"

export default function Privacidad() {
  return (
    <PublicLayout className="landing-typography">
      <main className="bg-[#faf9f5]">
        {/* Header */}
        <div className="border-b border-[#e0dcd0] bg-[#120c08] px-5 pb-16 pt-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#c28a3a]">
              Legal
            </p>
            <h1 className="font-serif text-4xl font-bold text-[#fffaf1] sm:text-5xl">
              Política de Privacidad
            </h1>
            <p className="mt-4 text-sm text-[#b8a99a]">
              Última actualización: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="prose prose-stone max-w-none text-[#504442] [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#271310] [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-[#271310] [&_p]:mb-4 [&_p]:leading-7 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc [&_li]:leading-7 [&_a]:font-semibold [&_a]:text-[#271310] [&_a]:underline">

            <p>
              La Asociación Café Robusta OBC (<strong>ACARO OBC</strong>), con sitio web en{" "}
              <a href="https://acaro.org">acaro.org</a>, es responsable del tratamiento
              de los datos personales que usted nos proporciona a través de este portal.
              Esta política explica qué datos recopilamos, para qué los usamos y cómo los
              protegemos.
            </p>

            <h2>1. ¿Qué información recopilamos?</h2>
            <p>Podemos recopilar los siguientes tipos de información:</p>
            <ul>
              <li>
                <strong>Datos de contacto:</strong> nombre, correo electrónico y el contenido
                del mensaje cuando completa el formulario de contacto.
              </li>
              <li>
                <strong>Datos de uso:</strong> páginas visitadas, tiempo de permanencia y
                dispositivo utilizado, recopilados de forma anónima a través de herramientas
                de analítica web.
              </li>
              <li>
                <strong>Cookies:</strong> pequeños archivos de texto almacenados en su
                navegador para mejorar su experiencia en el sitio. Consulte la sección de
                Cookies más abajo.
              </li>
            </ul>

            <h2>2. ¿Para qué usamos sus datos?</h2>
            <ul>
              <li>Responder a consultas y solicitudes enviadas a través del formulario de contacto.</li>
              <li>Mejorar el contenido y la experiencia de navegación del portal.</li>
              <li>Analizar el tráfico y el comportamiento de los visitantes de forma agregada y anónima.</li>
              <li>Cumplir con obligaciones legales aplicables.</li>
            </ul>

            <h2>3. Base legal del tratamiento</h2>
            <p>
              El tratamiento de sus datos se realiza en base a: (a) su consentimiento
              explícito cuando nos contacta o acepta el uso de cookies; (b) el interés
              legítimo de ACARO OBC para operar y mejorar el portal institucional.
            </p>

            <h2>4. ¿Compartimos sus datos?</h2>
            <p>
              No vendemos ni cedemos sus datos personales a terceros con fines comerciales.
              Podemos compartirlos únicamente con:
            </p>
            <ul>
              <li>
                Proveedores de servicios tecnológicos necesarios para operar el portal
                (alojamiento web, correo electrónico), bajo acuerdos de confidencialidad.
              </li>
              <li>
                Autoridades competentes si así lo exige la ley panameña o una resolución judicial.
              </li>
            </ul>

            <h2>5. Cookies</h2>
            <p>Utilizamos cookies para:</p>
            <ul>
              <li>Recordar sus preferencias de sesión.</li>
              <li>Medir el tráfico del sitio de forma anónima mediante herramientas de analítica.</li>
            </ul>
            <p>
              Puede configurar su navegador para rechazar cookies o para que le avise antes
              de aceptarlas. Tenga en cuenta que algunas funcionalidades del portal pueden
              verse afectadas si las cookies están desactivadas.
            </p>

            <h2>6. Retención de datos</h2>
            <p>
              Los datos de contacto se conservan durante el tiempo necesario para responder
              su consulta y un máximo de 12 meses adicionales, salvo que exista una
              obligación legal de conservarlos por más tiempo.
            </p>

            <h2>7. Sus derechos</h2>
            <p>
              Como titular de sus datos, usted tiene derecho a:
            </p>
            <ul>
              <li>Acceder a los datos personales que tenemos sobre usted.</li>
              <li>Solicitar la rectificación de datos inexactos.</li>
              <li>Solicitar la supresión de sus datos cuando ya no sean necesarios.</li>
              <li>Oponerse al tratamiento de sus datos en determinadas circunstancias.</li>
              <li>Solicitar la limitación del tratamiento.</li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, escríbanos a{" "}
              <a href="mailto:contacto@acaro.org">contacto@acaro.org</a>.
            </p>

            <h2>8. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y organizativas razonables para proteger sus datos
              contra accesos no autorizados, pérdida o divulgación. Sin embargo, ninguna
              transmisión por internet es completamente segura.
            </p>

            <h2>9. Cambios en esta política</h2>
            <p>
              Podemos actualizar esta política periódicamente. La fecha de la última
              actualización aparece en la parte superior de esta página. Le recomendamos
              revisarla regularmente.
            </p>

            <h2>10. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con esta política de privacidad, puede
              contactarnos en:
            </p>
            <ul>
              <li>
                <strong>Correo:</strong>{" "}
                <a href="mailto:contacto@acaro.org">contacto@acaro.org</a>
              </li>
              <li>
                <strong>Sitio web:</strong>{" "}
                <a href="https://acaro.org/contacto">acaro.org/contacto</a>
              </li>
              <li>
                <strong>Sede:</strong> República de Panamá
              </li>
            </ul>
          </div>

          <div className="mt-14 border-t border-[#e0dcd0] pt-8 text-sm text-[#8b6a4f]">
            <p>
              Esta política aplica exclusivamente al portal web{" "}
              <strong>acaro.org</strong> operado por la Asociación Café Robusta OBC.
            </p>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
