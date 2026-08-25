import type { Metadata } from "next"
import { PublicLayout } from "@/components/layout/PublicLayout"

export const metadata: Metadata = {
  title: "Términos y Condiciones | ACARO OBC",
  description:
    "Términos y condiciones de uso del portal institucional de la Asociación Café Robusta OBC.",
  openGraph: {
    title: "Términos y Condiciones | ACARO OBC",
    description:
      "Condiciones de uso del portal web de ACARO OBC, Asociación Café Robusta.",
    url: "https://acaro.org/terminos",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/landing-hero-v2.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

const lastUpdated = "25 de agosto de 2026"

export default function Terminos() {
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
              Términos y Condiciones
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
              Al acceder y utilizar el portal web{" "}
              <a href="https://acaro.org">acaro.org</a>, usted acepta los presentes
              Términos y Condiciones de Uso establecidos por la{" "}
              <strong>Asociación Café Robusta OBC (ACARO OBC)</strong>. Si no está de
              acuerdo con estos términos, le pedimos que se abstenga de usar el sitio.
            </p>

            <h2>1. Objeto del portal</h2>
            <p>
              El portal <strong>acaro.org</strong> es el canal institucional de ACARO OBC,
              destinado a difundir información sobre la asociación, sus proyectos,
              biblioteca técnica, productores asociados y servicios vinculados al café
              robusta en Panamá. El acceso al portal es gratuito y de carácter público,
              salvo en las secciones de administración interna que requieren credenciales.
            </p>

            <h2>2. Uso aceptable</h2>
            <p>El usuario se compromete a:</p>
            <ul>
              <li>Utilizar el portal de forma lícita y conforme a estos términos.</li>
              <li>No reproducir, distribuir o modificar los contenidos sin autorización expresa.</li>
              <li>No intentar acceder a áreas restringidas o sistemas del portal sin autorización.</li>
              <li>No utilizar el portal para enviar comunicaciones no solicitadas (spam).</li>
              <li>Proporcionar información veraz al completar el formulario de contacto.</li>
            </ul>

            <h2>3. Propiedad intelectual</h2>
            <p>
              Todos los contenidos del portal — incluyendo textos, imágenes, logotipos,
              documentos de la biblioteca técnica, diseño y código — son propiedad de
              ACARO OBC o de sus respectivos autores, y están protegidos por las leyes
              de propiedad intelectual de la República de Panamá.
            </p>
            <p>
              Los documentos de la biblioteca técnica pueden descargarse para uso
              personal, educativo o de investigación, siempre que se cite la fuente.
              Cualquier uso comercial requiere autorización escrita de ACARO OBC.
            </p>

            <h2>4. Exención de responsabilidad</h2>
            <p>ACARO OBC no se hace responsable de:</p>
            <ul>
              <li>
                Errores u omisiones en los contenidos del portal, aunque se esfuerza por
                mantenerlos actualizados y precisos.
              </li>
              <li>
                Interrupciones temporales del servicio por mantenimiento o causas técnicas.
              </li>
              <li>
                Daños derivados del uso inadecuado del portal por parte del usuario.
              </li>
              <li>
                El contenido de sitios web de terceros enlazados desde este portal.
              </li>
            </ul>

            <h2>5. Enlace a sitios externos</h2>
            <p>
              El portal puede contener enlaces a sitios web de terceros (aliados,
              instituciones gubernamentales, publicaciones externas). ACARO OBC no
              controla ni garantiza la disponibilidad, seguridad o contenido de esos sitios
              y no asume responsabilidad alguna sobre ellos.
            </p>

            <h2>6. Modificaciones del servicio</h2>
            <p>
              ACARO OBC se reserva el derecho de modificar, suspender o discontinuar
              cualquier sección del portal en cualquier momento y sin previo aviso, así
              como de actualizar estos Términos y Condiciones. El uso continuado del
              portal después de cualquier modificación implica la aceptación de los nuevos
              términos.
            </p>

            <h2>7. Privacidad y datos personales</h2>
            <p>
              El tratamiento de datos personales recopilados a través del portal se rige
              por nuestra{" "}
              <a href="/privacidad">Política de Privacidad</a>, que forma parte
              integrante de estos términos.
            </p>

            <h2>8. Ley aplicable y jurisdicción</h2>
            <p>
              Estos Términos y Condiciones se rigen por las leyes de la República de
              Panamá. Cualquier disputa derivada del uso del portal estará sujeta a la
              jurisdicción de los tribunales competentes de la República de Panamá.
            </p>

            <h2>9. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con estos términos, puede contactarnos en:
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
            </ul>
          </div>

          <div className="mt-14 border-t border-[#e0dcd0] pt-8 text-sm text-[#8b6a4f]">
            <p>
              Estos términos rigen exclusivamente el portal web{" "}
              <strong>acaro.org</strong> operado por la Asociación Café Robusta OBC.
            </p>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
