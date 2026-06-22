/**
 * ACARO OBC — Migración de datos de Supabase a MySQL
 *
 * Este script lee las encuestas existentes de Supabase (PostgreSQL/UUIDs)
 * y las inserta en MySQL (INT AUTO_INCREMENT) manteniendo las relaciones.
 *
 * Uso:
 *   1. Instalar dependencias (si no están):
 *      npm install @supabase/supabase-js mysql2 dotenv
 *
 *   2. Crear archivo .env.migration en esta carpeta con:
 *      SUPABASE_URL=https://tu-proyecto.supabase.co
 *      SUPABASE_ANON_KEY=tu-anon-key
 *      MYSQL_HOST=82.25.83.24
 *      MYSQL_PORT=3306
 *      MYSQL_USER=u271420828_acaro_admin
 *      MYSQL_PASSWORD=tu-password
 *      MYSQL_DATABASE=u271420828_acaro_db
 *      ACARO_USER_ID=1
 *
 *   3. Ejecutar:
 *      node 003_migrate_supabase_data.js
 *
 * ACARO_USER_ID es el id del usuario de ACARO que se asignará como creador
 * de las encuestas migradas (ya que en Supabase no hay relación con users de ACARO).
 *
 * El script es idempotente: si se ejecuta dos veces, creará duplicados.
 * Recomendación: ejecutar solo una vez después de crear las tablas.
 */

require('dotenv').config({ path: __dirname + '/.env.migration' });
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');

const ACARO_USER_ID = Number(process.env.ACARO_USER_ID) || 1;

async function main() {
  // ─── Conectar a Supabase ────────────────────────────────
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  // ─── Conectar a MySQL ──────────────────────────────────
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  console.log('Conectado a Supabase y MySQL.\n');

  // ─── 1. Leer encuestas de Supabase ─────────────────────
  const { data: encuestas, error: encErr } = await supabase
    .from('encuestas')
    .select('*')
    .order('fecha_creacion', { ascending: true });

  if (encErr) throw new Error(`Error leyendo encuestas: ${encErr.message}`);
  console.log(`Encuestas encontradas en Supabase: ${encuestas.length}`);

  // Mapa UUID → INT para mantener relaciones
  const encuestaMap = {};   // uuid → mysql id
  const seccionMap = {};    // uuid → mysql id
  const preguntaMap = {};   // uuid → mysql id
  const opcionMap = {};     // uuid → mysql id
  const respuestaMap = {};  // uuid → mysql id
  const detalleMap = {};    // uuid → mysql id

  // ─── 2. Migrar cada encuesta ───────────────────────────
  for (const enc of encuestas) {
    const slug = slugify(enc.titulo) || `encuesta-${Date.now()}`;
    const estado = mapEstado(enc.estado);

    const [result] = await db.execute(
      `INSERT INTO encuestas
         (titulo, slug, descripcion, estado, visibilidad, logo_url,
          created_by_user_id, requiere_login, permitir_multiples_respuestas,
          mensaje_confirmacion, configuracion_json)
       VALUES (?, ?, ?, ?, 'publica', ?, ?, 0, 0, NULL, NULL)`,
      [
        enc.titulo,
        slug,
        enc.descripcion || null,
        estado,
        enc.logo_url || null,
        ACARO_USER_ID,
      ]
    );
    const mysqlEncId = result.insertId;
    encuestaMap[enc.id] = mysqlEncId;
    console.log(`  Encuesta: "${enc.titulo}" → id=${mysqlEncId}`);
  }

  // ─── 3. Migrar secciones ──────────────────────────────
  const { data: secciones, error: secErr } = await supabase
    .from('secciones_encuesta')
    .select('*')
    .order('posicion', { ascending: true });

  if (secErr) throw new Error(`Error leyendo secciones: ${secErr.message}`);
  console.log(`\nSecciones encontradas: ${secciones.length}`);

  for (const sec of secciones) {
    const mysqlEncId = encuestaMap[sec.encuesta_id];
    if (!mysqlEncId) { console.log(`  SKIP sección sin encuesta: ${sec.id}`); continue; }

    const [result] = await db.execute(
      `INSERT INTO encuesta_secciones (encuesta_id, titulo, descripcion, posicion)
       VALUES (?, ?, ?, ?)`,
      [mysqlEncId, sec.titulo || null, sec.descripcion || null, sec.posicion ?? 0]
    );
    seccionMap[sec.id] = result.insertId;
  }

  // ─── 4. Migrar preguntas ──────────────────────────────
  const { data: preguntas, error: pregErr } = await supabase
    .from('preguntas_encuesta')
    .select('*')
    .order('posicion', { ascending: true });

  if (pregErr) throw new Error(`Error leyendo preguntas: ${pregErr.message}`);
  console.log(`Preguntas encontradas: ${preguntas.length}`);

  for (const preg of preguntas) {
    const mysqlEncId = encuestaMap[preg.encuesta_id];
    if (!mysqlEncId) { console.log(`  SKIP pregunta sin encuesta: ${preg.id}`); continue; }

    const mysqlSecId = preg.seccion_id ? (seccionMap[preg.seccion_id] || null) : null;
    const reglas = preg.reglas_validacion ? JSON.stringify(preg.reglas_validacion) : null;

    const [result] = await db.execute(
      `INSERT INTO encuesta_preguntas
         (encuesta_id, seccion_id, codigo_pregunta, texto_pregunta, tipo_pregunta,
          posicion, texto_ayuda, reglas_validacion, es_obligatoria)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mysqlEncId,
        mysqlSecId,
        preg.codigo_pregunta || null,
        preg.texto_pregunta,
        preg.tipo_pregunta,
        preg.posicion ?? 0,
        preg.texto_ayuda || null,
        reglas,
        preg.es_obligatoria ? 1 : 0,
      ]
    );
    preguntaMap[preg.id] = result.insertId;
  }

  // ─── 5. Migrar opciones ───────────────────────────────
  const { data: opciones, error: opcErr } = await supabase
    .from('opciones_pregunta')
    .select('*')
    .order('posicion', { ascending: true });

  if (opcErr) throw new Error(`Error leyendo opciones: ${opcErr.message}`);
  console.log(`Opciones encontradas: ${opciones.length}`);

  for (const opc of opciones) {
    const mysqlPregId = preguntaMap[opc.pregunta_id];
    if (!mysqlPregId) { console.log(`  SKIP opción sin pregunta: ${opc.id}`); continue; }

    const [result] = await db.execute(
      `INSERT INTO encuesta_opciones
         (pregunta_id, valor_opcion, etiqueta_opcion, posicion, permite_texto_libre)
       VALUES (?, ?, ?, ?, ?)`,
      [
        mysqlPregId,
        opc.valor_opcion,
        opc.etiqueta_opcion,
        opc.posicion ?? 0,
        opc.permite_texto_libre ? 1 : 0,
      ]
    );
    opcionMap[opc.id] = result.insertId;
  }

  // ─── 6. Migrar respuestas ─────────────────────────────
  const { data: respuestas, error: respErr } = await supabase
    .from('respuestas_encuesta')
    .select('*')
    .order('fecha_respuesta', { ascending: true });

  if (respErr) throw new Error(`Error leyendo respuestas: ${respErr.message}`);
  console.log(`Respuestas encontradas: ${respuestas.length}`);

  for (const resp of respuestas) {
    const mysqlEncId = encuestaMap[resp.encuesta_id];
    if (!mysqlEncId) { console.log(`  SKIP respuesta sin encuesta: ${resp.id}`); continue; }

    const fechaEnvio = resp.fecha_respuesta || null;

    const [result] = await db.execute(
      `INSERT INTO encuesta_respuestas
         (encuesta_id, user_id, estado, origen, datos_crudos, fecha_envio, created_at)
       VALUES (?, NULL, 'enviada', ?, ?, ?, ?)`,
      [
        mysqlEncId,
        resp.origen || 'web',
        resp.datos_crudos ? JSON.stringify(resp.datos_crudos) : null,
        fechaEnvio,
        fechaEnvio || new Date().toISOString(),
      ]
    );
    respuestaMap[resp.id] = result.insertId;
  }

  // ─── 7. Migrar detalles de respuesta ──────────────────
  const { data: detalles, error: detErr } = await supabase
    .from('respuestas_detalle')
    .select('*');

  if (detErr) throw new Error(`Error leyendo detalles: ${detErr.message}`);
  console.log(`Detalles de respuesta encontrados: ${detalles.length}`);

  for (const det of detalles) {
    const mysqlRespId = respuestaMap[det.respuesta_encuesta_id];
    const mysqlPregId = preguntaMap[det.pregunta_id];
    if (!mysqlRespId || !mysqlPregId) { continue; }

    const [result] = await db.execute(
      `INSERT INTO encuesta_respuestas_detalle
         (respuesta_encuesta_id, pregunta_id, respuesta_texto, respuesta_numero,
          respuesta_booleano, respuesta_fecha)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        mysqlRespId,
        mysqlPregId,
        det.respuesta_texto ?? null,
        det.respuesta_numero ?? null,
        det.respuesta_booleano != null ? (det.respuesta_booleano ? 1 : 0) : null,
        det.respuesta_fecha ?? null,
      ]
    );
    detalleMap[det.id] = result.insertId;
  }

  // ─── 8. Migrar opciones seleccionadas ─────────────────
  const { data: selecciones, error: selErr } = await supabase
    .from('respuestas_opciones_seleccionadas')
    .select('*');

  if (selErr) throw new Error(`Error leyendo selecciones: ${selErr.message}`);
  console.log(`Opciones seleccionadas encontradas: ${selecciones.length}`);

  for (const sel of selecciones) {
    const mysqlDetId = detalleMap[sel.respuesta_detalle_id];
    const mysqlOpcId = opcionMap[sel.opcion_id];
    if (!mysqlDetId || !mysqlOpcId) { continue; }

    await db.execute(
      `INSERT INTO encuesta_respuestas_opciones
         (respuesta_detalle_id, opcion_id, texto_libre)
       VALUES (?, ?, ?)`,
      [mysqlDetId, mysqlOpcId, sel.texto_libre || null]
    );
  }

  // ─── Resumen ──────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('Migración completada:');
  console.log(`  Encuestas:    ${Object.keys(encuestaMap).length}`);
  console.log(`  Secciones:    ${Object.keys(seccionMap).length}`);
  console.log(`  Preguntas:    ${Object.keys(preguntaMap).length}`);
  console.log(`  Opciones:     ${Object.keys(opcionMap).length}`);
  console.log(`  Respuestas:   ${Object.keys(respuestaMap).length}`);
  console.log(`  Detalles:     ${Object.keys(detalleMap).length}`);
  console.log(`  Selecciones:  ${selecciones.length}`);
  console.log('═══════════════════════════════════════');

  await db.end();
  process.exit(0);
}

// ─── Utilidades ─────────────────────────────────────────

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

function mapEstado(supabaseEstado) {
  const map = {
    borrador: 'borrador',
    publicada: 'publicada',
    cerrada: 'cerrada',
    archivada: 'archivada',
  };
  return map[supabaseEstado] || 'borrador';
}

main().catch(err => {
  console.error('\nError de migración:', err.message);
  process.exit(1);
});
