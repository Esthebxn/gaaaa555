const express = require('express');
const router = express.Router();

const FAQ_SEEDS = [
  ['¿Cuál es el horario de programación?', 'programacion', 'horario,programacion,programación,programas'],
  ['¿Qué programas hay hoy?', 'programacion', 'programas,programacion,programación,horario del día,horario de hoy'],
  ['¿Qué anunciantes están activos?', 'anunciantes', 'anunciantes,anunciante,publicidad,auspiciadores'],
  ['¿Cómo contacto a Zoom TV?', 'contacto', 'contacto,telefono,teléfono,correo,email'],
  ['¿Cuáles son las redes sociales de Zoom TV?', 'redes', 'redes,sociales,facebook,instagram,youtube,tiktok,twitter'],
  ['¿Qué es Zoom TV?', 'nosotros', 'zoomtv,zoom tv,empresa,nosotros,historia,mision,misión,vision,visión,valores'],
  ['¿Cómo puedo ver Zoom TV en vivo?', 'live', 'live,vivo,transmision,transmisión,stream'],
  ['¿Qué noticias tienen?', 'noticias', 'noticias,actualidad,nacionales,regionales,deportes,musica,música'],
  ['¿Qué categorías de noticias hay?', 'noticias', 'categorias,categorías,secciones,noticias'],
  ['¿Qué noticias hay en Actualidad?', 'noticias', 'actualidad,ultimas noticias,actuales'],
  ['¿Qué noticias hay en Deportes?', 'noticias', 'deportes,deporte,futbol'],
  ['¿Qué noticias hay en Música?', 'noticias', 'musica,musical,conciertos'],
  ['¿Qué noticias hay en Nacionales?', 'noticias', 'nacionales,nacional'],
  ['¿Qué noticias hay en Regionales?', 'noticias', 'regionales,regional,region'],
  ['¿Qué información puede dar Zoom TV Assistant?', 'ayuda', 'ayuda,informacion,información,opciones,consultas'],
];

const SOCIAL_SEEDS = [
  ['Facebook', 'https://www.facebook.com/zoomtvcanal10'],
  ['Instagram', 'https://instagram.com/zoomtv'],
  ['YouTube', 'https://www.youtube.com/@goyozoom'],
  ['X', 'https://twitter.com/zoomtv'],
];

const normalize = (value = '') => String(value).toLocaleLowerCase('es')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9@.+:/-]+/g, ' ').trim();

function query(sql, values = []) {
  return new Promise((resolve, reject) => global.db.query(sql, values, (error, rows) => error ? reject(error) : resolve(rows)));
}

let initPromise;
function ensureAssistantTables() {
  if (!initPromise) {
    initPromise = (async () => {
      await query(`CREATE TABLE IF NOT EXISTS assistant_faq (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pregunta VARCHAR(500) NOT NULL,
        categoria VARCHAR(80) NOT NULL,
        palabras_clave TEXT,
        respuesta TEXT,
        activa BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_assistant_faq_question (pregunta(191))
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await query(`CREATE TABLE IF NOT EXISTS assistant_social_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plataforma VARCHAR(80) NOT NULL UNIQUE,
        url VARCHAR(1000) NOT NULL,
        activa BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      for (const [pregunta, categoria, palabras_clave] of FAQ_SEEDS) {
        await query('INSERT IGNORE INTO assistant_faq (pregunta, categoria, palabras_clave) VALUES (?, ?, ?)', [pregunta, categoria, palabras_clave]);
      }
      for (const [plataforma, url] of SOCIAL_SEEDS) {
        await query('INSERT IGNORE INTO assistant_social_links (plataforma, url) VALUES (?, ?)', [plataforma, url]);
      }
    })().catch((error) => { initPromise = null; throw error; });
  }
  return initPromise;
}

function matches(text, words) {
  return words.some((word) => text.includes(normalize(word)));
}

function uniqueScheduleSlots(rows) {
  const slots = new Map();
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const corruptionScore = (row) => `${row.nombre_programa || ''} ${row.conductor || ''} ${row.descripcion || ''}`
    .match(/[?├┬ÃÂ�]/g)?.length || 0;
  for (const row of rows) {
    const key = `${normalize(row.dia_semana || '')}|${row.horario_inicio}|${row.horario_fin}|${normalize(row.categoria || '')}`;
    const current = slots.get(key);
    if (!current || corruptionScore(row) < corruptionScore(current)) slots.set(key, row);
  }
  return [...slots.values()].sort((a, b) => {
    const dayOrder = days.indexOf(normalize(a.dia_semana)) - days.indexOf(normalize(b.dia_semana));
    return dayOrder || String(a.horario_inicio).localeCompare(String(b.horario_inicio));
  });
}

function pickIntent(text, faqRows = []) {
  // Primero se resuelven señales explícitas para que palabras comunes como "hoy"
  // no desvíen una pregunta sobre noticias hacia programación.
  if (matches(text, ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches'])) return 'saludo';
  if (matches(text, ['gracias', 'muchas gracias'])) return 'gracias';
  if (matches(text, ['programacion', 'horario', 'programa', 'programas', 'que dan', 'que pasan', 'a que hora'])) return 'programacion';
  if (matches(text, ['anunciante', 'anunciantes', 'publicidad', 'auspiciador', 'patrocinador'])) return 'anunciantes';
  if (matches(text, ['redes', 'facebook', 'instagram', 'youtube', 'tiktok', 'twitter', 'x.com'])) return 'redes';
  if (matches(text, ['contacto', 'telefono', 'correo', 'email', 'direccion', 'ubicacion'])) return 'contacto';
  if (matches(text, ['mision', 'vision', 'valores', 'historia', 'equipo', 'quienes son', 'quienes somos', 'zoom tv', 'zoomtv', 'empresa', 'nosotros'])) return 'nosotros';
  if (matches(text, ['en vivo', 'live', 'stream', 'transmision', 'ver el canal'])) return 'live';
  if (matches(text, ['noticia', 'noticias', 'actualidad', 'nacional', 'regional', 'deporte', 'musica', 'secciones', 'ultimas noticias', 'que hay de nuevo', 'de que trata', 'que paso', 'relevante', 'destacada', 'portada'])) return 'noticias';
  if (matches(text, ['ayuda', 'informacion', 'opciones', 'que puedes hacer'])) return 'ayuda';
  const faqMatch = faqRows
    .map((row) => ({ ...row, terms: String(row.palabras_clave || '').split(',').map(normalize).filter(Boolean) }))
    .flatMap((row) => row.terms.filter((term) => term.length >= 4 && text.includes(term)).map((term) => ({ category: row.categoria, term })))
    .sort((a, b) => b.term.length - a.term.length)[0];
  if (faqMatch && ['programacion', 'anunciantes', 'contacto', 'redes', 'nosotros', 'live', 'noticias', 'ayuda'].includes(faqMatch.category)) return faqMatch.category;
  return null;
}

const dayAliases = {
  lunes: 'Lunes', martes: 'Martes', miercoles: `Mi${String.fromCharCode(233)}rcoles`, jueves: 'Jueves',
  viernes: 'Viernes', sabado: `S${String.fromCharCode(225)}bado`, domingo: 'Domingo'
};

function dayForRelativeDate(text) {
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'America/Lima' }).format(new Date()).toLowerCase();
  const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(today);
  if (text.includes('hoy')) return Object.values(dayAliases)[dayIndex === 0 ? 6 : dayIndex - 1];
  if (text.includes('manana')) return Object.values(dayAliases)[dayIndex];
  return null;
}

function isAskingWhatIsOnNow(text) {
  const asksForProgram = matches(text, ['programa', 'programacion', 'que estan dando', 'que estan pasando', 'que se esta mostrando', 'que se transmite']);
  const asksForNow = matches(text, ['ahora', 'actualmente', 'en este momento', 'ahorita']);
  return asksForProgram && asksForNow;
}

function limaScheduleNow() {
  const now = new Date();
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'America/Lima' }).format(now).toLowerCase();
  const dayMap = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' };
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
  return { day: dayMap[dayName], minutes: hour * 60 + minute };
}

function timeToMinutes(value) {
  const match = String(value || '').match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function newsCard(story, req) {
  const origin = `${req.protocol}://${req.get('host')}`;
  let image = String(story.imagen_url || story.imagen || '').trim();
  if (image && !/^https?:\/\//i.test(image) && !image.startsWith('data:')) {
    const imagePath = image.startsWith('/') ? image : image.startsWith('uploads/') ? `/${image}` : `/uploads/${image}`;
    image = `${origin}${imagePath.split('/').map((part, index) => {
      if (index < 3) return part;
      try { return encodeURIComponent(decodeURIComponent(part)); } catch { return encodeURIComponent(part); }
    }).join('/')}`;
  }
  const summary = String(story.descripcion || story.resumen || story.contenido || '')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const slug = normalize(story.categoria || 'actualidad').replace(/\s+/g, '-');
  return {
    id: story.id,
    title: story.titulo,
    category: story.categoria || 'Noticias',
    summary: summary || 'Abre la noticia para leer todos los detalles.',
    image: image || null,
    date: story.fecha || '',
    source: story.fuente || '',
    href: `/noticia/${slug}/${story.id}`
  };
}

async function answer(question, faqRows, inheritedIntent = null, req) {
  const text = normalize(question);
  const hasDay = Object.keys(dayAliases).some((day) => text.includes(day)) || matches(text, ['hoy', 'manana']);
  const asksCurrentProgram = isAskingWhatIsOnNow(text);
  const intent = asksCurrentProgram ? 'current_program' : pickIntent(text, faqRows) || (hasDay && inheritedIntent === 'programacion' ? 'programacion' : null);
  if (!intent && text.split(' ').length >= 4) {
    const recentStories = await query('SELECT id, titulo, contenido, resumen, descripcion, categoria, fecha, fecha_publicacion, fuente, imagen_url, imagen, destacada FROM noticias WHERE activa = TRUE ORDER BY fecha_publicacion DESC, id DESC LIMIT 60');
    const ignoredWords = new Set(['noticia', 'noticias', 'actualidad', 'nacional', 'nacionales', 'regional', 'regionales', 'deportes', 'deporte', 'musica', 'secciones', 'titular', 'titulares', 'trata', 'sobre', 'dime', 'cuentame', 'cual', 'cuales', 'quiero', 'saber', 'que', 'hay', 'del', 'para', 'una', 'esta', 'este']);
    const terms = text.split(' ').filter((word) => word.length >= 4 && !ignoredWords.has(word));
    const match = recentStories.map((story) => ({ story, score: terms.filter((word) => normalize(story.titulo).split(' ').includes(word)).length }))
      .sort((a, b) => b.score - a.score)[0];
    if (match?.score >= 2) return { response: 'Encontré esta noticia:', newsCards: [newsCard(match.story, req)] };
  }
  if (!intent) return 'Puedo ayudarte con la programación, anunciantes, noticias, redes sociales, información de Zoom TV y la transmisión en vivo. ¿Qué deseas consultar?';
  if (intent === 'saludo') return '¡Hola! Soy Zoom TV Assistant. Puedo ayudarte a consultar programación, noticias, anunciantes, redes sociales y datos del canal.';
  if (intent === 'gracias') return '¡Con gusto! Aquí estoy para ayudarte.';
  if (intent === 'ayuda') return 'Puedo consultar la programación por día, los programas y horarios, anunciantes y sus datos de contacto, noticias recientes, información institucional de Zoom TV, redes sociales y el enlace de transmisión en vivo.';

  if (intent === 'current_program') {
    const { day, minutes } = limaScheduleNow();
    const [programs, streams] = await Promise.all([
      query('SELECT nombre_programa, descripcion, horario_inicio, horario_fin, conductor FROM programacion WHERE activo = TRUE AND dia_semana = ? ORDER BY horario_inicio', [day]),
      query('SELECT titulo, descripcion, url_stream FROM live_stream WHERE activo = TRUE ORDER BY id DESC LIMIT 1')
    ]);
    const currentProgram = uniqueScheduleSlots(programs).find((program) => {
      const start = timeToMinutes(program.horario_inicio);
      const end = timeToMinutes(program.horario_fin);
      if (start === null || end === null) return false;
      return end > start ? minutes >= start && minutes < end : minutes >= start || minutes < end;
    });
    const stream = streams[0];
    if (!currentProgram) {
      return {
        response: stream
          ? `Ahora en Zoom TV: ${stream.titulo}${stream.descripcion ? `\n${stream.descripcion}` : ''}`
          : `No encuentro un programa activo para este momento (${day}) ni una transmisión en vivo activa.`,
        ...(stream ? { liveCta: { label: 'Ver Live', href: '/live' } } : {})
      };
    }
    const timeLabel = `${String(currentProgram.horario_inicio).slice(0, 5)}–${String(currentProgram.horario_fin).slice(0, 5)}`;
    return {
      response: `Ahora en Zoom TV: ${currentProgram.nombre_programa} (${timeLabel})${currentProgram.conductor ? `\nConduce: ${currentProgram.conductor}` : ''}${currentProgram.descripcion ? `\n${currentProgram.descripcion}` : ''}`,
      ...(stream ? { liveCta: { label: 'Ver Live', href: '/live' } } : {})
    };
  }

  if (intent === 'programacion') {
    const dayKey = Object.keys(dayAliases).find((day) => text.includes(day));
    const day = dayKey ? dayAliases[dayKey] : dayForRelativeDate(text);
    let rows = day
      ? await query('SELECT nombre_programa, descripcion, horario_inicio, horario_fin, dia_semana, conductor, categoria FROM programacion WHERE activo = TRUE AND dia_semana = ? ORDER BY horario_inicio', [day])
      : await query('SELECT nombre_programa, descripcion, horario_inicio, horario_fin, dia_semana, conductor, categoria FROM programacion WHERE activo = TRUE ORDER BY horario_inicio');
    const uniqueRows = uniqueScheduleSlots(rows);
    const namedProgram = uniqueRows.filter((row) => normalize(row.nombre_programa).length >= 5 && text.includes(normalize(row.nombre_programa)));
    const selectedRows = namedProgram.length ? namedProgram : uniqueRows;
    if (!selectedRows.length) return `No hay programas activos${day ? ` para ${day}` : ''} en este momento.`;
    const heading = day ? `Programación del ${day}:` : 'Programación disponible:';
    return `${namedProgram.length ? `Horario de ${namedProgram[0].nombre_programa}:` : heading}\n${selectedRows.slice(0, 35).map((r) => `• ${!day ? `${r.dia_semana}: ` : ''}${String(r.horario_inicio).slice(0, 5)}–${String(r.horario_fin).slice(0, 5)} ${r.nombre_programa}${r.conductor ? ` — ${r.conductor}` : ''}${r.categoria ? ` (${r.categoria})` : ''}`).join('\n')}${selectedRows.length > 35 ? '\nConsulta la página de Programación para ver el horario completo.' : ''}`;
  }

  if (intent === 'anunciantes') {
    const rows = await query('SELECT nombre_empresa, categoria, descripcion, telefono, email, direccion, horario, sitio_web FROM anunciantes WHERE activo = TRUE ORDER BY nombre_empresa');
    if (!rows.length) return 'No hay anunciantes activos publicados por ahora.';
    const specific = [...rows].sort((a, b) => normalize(b.nombre_empresa).length - normalize(a.nombre_empresa).length)
      .find((r) => text.includes(normalize(r.nombre_empresa)) || normalize(r.nombre_empresa).split(' ').some((word) => word.length >= 5 && text.includes(word)));
    const wantsDetails = matches(text, ['horario', 'telefono', 'correo', 'direccion', 'descripcion', 'contacto', 'web']);
    const list = specific ? [specific] : rows;
    if (!specific && !wantsDetails) return `Hay ${rows.length} anunciantes activos:\n${rows.slice(0, 30).map((r) => `• ${r.nombre_empresa}${r.categoria ? ` — ${r.categoria}` : ''}`).join('\n')}${rows.length > 30 ? '\nVisita Anunciantes para ver más.' : ''}`;
    return `Anunciantes activos${specific ? '' : ` (${rows.length})`}:\n${list.slice(0, 10).map((r) => `• ${r.nombre_empresa}${r.categoria ? ` — ${r.categoria}` : ''}${r.telefono ? `\n  Teléfono: ${r.telefono}` : ''}${r.email ? `\n  Correo: ${r.email}` : ''}${r.horario ? `\n  Horario: ${r.horario}` : ''}${r.direccion ? `\n  Dirección: ${r.direccion}` : ''}${r.sitio_web ? `\n  Web: ${r.sitio_web}` : ''}${specific && r.descripcion ? `\n  ${r.descripcion}` : ''}`).join('\n')}${list.length > 10 ? '\nVisita Anunciantes para ver más.' : ''}`;
  }

  if (intent === 'redes') {
    const rows = await query('SELECT plataforma, url FROM assistant_social_links WHERE activa = TRUE ORDER BY plataforma');
    if (!rows.length) return 'Todavía no hay enlaces sociales publicados.';
    const platform = rows.find((row) => text.includes(normalize(row.plataforma)) || (normalize(row.plataforma) === 'x' && matches(text, ['twitter', 'x.com'])));
    return platform
      ? `El enlace oficial de ${platform.plataforma} es ${platform.url}`
      : `Puedes encontrarnos en estas redes oficiales:\n${rows.map((r) => `• ${r.plataforma}: ${r.url}`).join('\n')}`;
  }

  if (intent === 'contacto' || intent === 'nosotros') {
    const rows = await query('SELECT nombre_empresa, slogan, descripcion, historia, mision, vision, valores, equipo, email, telefono FROM nosotros ORDER BY id DESC LIMIT 1');
    const info = rows[0];
    if (!info) return 'Aún no hay información de Zoom TV publicada.';
    if (intent === 'contacto') return `Puedes contactar a ${info.nombre_empresa || 'Zoom TV'}:${info.email ? `\n• Correo: ${info.email}` : ''}${info.telefono ? `\n• Teléfono: ${info.telefono}` : ''}${info.slogan ? `\n• ${info.slogan}` : ''}`;
    const fields = [['Acerca de', info.descripcion], ['Historia', info.historia], ['Misión', info.mision], ['Visión', info.vision], ['Valores', info.valores], ['Equipo', info.equipo]];
    const asked = fields.filter(([name]) => text.includes(normalize(name)) || (name === 'Acerca de' && matches(text, ['que es', 'empresa', 'nosotros'])));
    const selected = asked.length ? asked : fields.filter(([, value]) => value);
    return `${info.nombre_empresa || 'Zoom TV'}${info.slogan ? ` — ${info.slogan}` : ''}\n${selected.filter(([, value]) => value).map(([name, value]) => `${name}: ${value}`).join('\n\n') || 'Consulta la página Nosotros para conocer más.'}${info.email || info.telefono ? `\n\nContacto: ${[info.email, info.telefono].filter(Boolean).join(' · ')}` : ''}`;
  }

  if (intent === 'live') {
    const rows = await query('SELECT titulo, url_stream, descripcion FROM live_stream WHERE activo = TRUE ORDER BY id DESC LIMIT 1');
    return rows[0] ? `${rows[0].titulo}${rows[0].descripcion ? `\n${rows[0].descripcion}` : ''}\nMíranos en vivo: ${rows[0].url_stream}` : 'No hay una transmisión en vivo activa en este momento.';
  }

  if (intent === 'noticias') {
    const categories = await query('SELECT DISTINCT categoria FROM noticias WHERE activa = TRUE AND categoria IS NOT NULL ORDER BY categoria');
    const sectionAliases = [
      { category: 'Actualidad', words: ['actualidad', 'ultimas', 'actuales'] },
      { category: 'Deportes', words: ['deportes', 'deporte', 'futbol'] },
      { category: 'Música', words: ['musica', 'musical', 'conciertos'] },
      { category: 'Nacionales', words: ['nacionales', 'nacional'] },
      { category: 'Regionales', words: ['regionales', 'regional', 'region'] }
    ];
    const matchedSection = sectionAliases.find((section) => section.words.some((word) => text.includes(normalize(word))));
    const askedCategory = (matchedSection && categories.find((row) => normalize(row.categoria) === normalize(matchedSection.category))?.categoria)
      || (matchedSection ? matchedSection.category : categories.find((row) => text.includes(normalize(row.categoria)))?.categoria);
    const wantsMostRelevant = matches(text, ['relevante', 'destacada', 'importante', 'principal', 'portada']);
    const rows = askedCategory
      ? await query(`SELECT id, titulo, contenido, resumen, descripcion, categoria, fecha, fecha_publicacion, fuente, imagen_url, imagen, destacada FROM noticias WHERE activa = TRUE AND categoria = ? ORDER BY ${wantsMostRelevant ? 'destacada DESC, ' : ''}fecha_publicacion DESC, id DESC LIMIT 30`, [askedCategory])
      : await query(`SELECT id, titulo, contenido, resumen, descripcion, categoria, fecha, fecha_publicacion, fuente, imagen_url, imagen, destacada FROM noticias WHERE activa = TRUE ORDER BY ${wantsMostRelevant ? 'destacada DESC, ' : ''}fecha_publicacion DESC, id DESC LIMIT 60`);
    if (!rows.length) return `No hay noticias publicadas${askedCategory ? ` en ${askedCategory}` : ''} en este momento.`;

    const ignoredWords = new Set(['noticia', 'noticias', 'actualidad', 'nacional', 'nacionales', 'regional', 'regionales', 'deportes', 'deporte', 'musica', 'secciones', 'titular', 'titulares', 'trata', 'sobre', 'dime', 'cuentame', 'cual', 'cuales', 'quiero', 'saber', 'que', 'hay', 'del', 'para', 'una', 'esta', 'este']);
    const questionWords = text.split(' ').filter((word) => word.length >= 4 && !ignoredWords.has(word));
    const scoredStories = rows.map((story) => {
      const titleWords = normalize(story.titulo).split(' ').filter((word) => word.length >= 4);
      return { story, score: questionWords.filter((word) => titleWords.includes(word)).length };
    }).sort((a, b) => b.score - a.score);
    const matchedStory = scoredStories[0]?.score >= 2 ? scoredStories[0].story : null;
    if (matchedStory) return { response: 'Encontré esta noticia:', newsCards: [newsCard(matchedStory, req)] };

    const allSections = matches(text, ['todas las secciones', 'cada seccion', 'todas las noticias']);
    let selected;
    let heading;
    if (allSections) {
      const bySection = new Map();
      for (const story of rows) {
        const section = story.categoria || 'Otras';
        const list = bySection.get(section) || [];
        if (list.length < 2) list.push(story);
        bySection.set(section, list);
      }
      selected = [...bySection.entries()].flatMap(([section, stories]) => stories.map((story) => ({ ...story, categoria: section })));
      heading = 'Lo más reciente de cada sección:';
    } else if (wantsMostRelevant) {
      selected = rows.slice(0, 1);
      heading = 'La noticia más relevante:';
    } else {
      selected = rows.slice(0, 6);
      heading = askedCategory ? `Noticias de ${askedCategory}:` : 'Últimas noticias:';
    }
    const featuredStories = allSections
      ? selected.filter((story, index, list) => list.findIndex((item) => item.categoria === story.categoria) === index)
      : selected.slice(0, 1);
    const featuredIds = new Set(featuredStories.map((story) => story.id));
    const storyLines = selected.filter((story) => !featuredIds.has(story.id))
      .map((story) => `• ${story.titulo}${allSections && story.categoria ? ` [${story.categoria}]` : ''}${story.fecha ? ` (${story.fecha})` : ''}`);
    const availableSections = categories.map((row) => row.categoria).filter(Boolean).join(', ');
    const responseText = `${heading}${storyLines.length ? `\n${storyLines.join('\n')}` : ''}${!askedCategory && !allSections && !wantsMostRelevant && availableSections ? `\n\nTambién puedes preguntar por: ${availableSections}.` : ''}`;
    return { response: responseText, newsCards: featuredStories.map((story) => newsCard(story, req)) };
  }
  return '¿Qué información necesitas?';
}

router.post('/chat', async (req, res) => {
  const question = String(req.body?.message || req.body?.question || '').trim();
  if (!question) return res.status(400).json({ error: 'Escribe una pregunta para el asistente.' });
  if (question.length > 1000) return res.status(400).json({ error: 'La pregunta no puede superar los 1000 caracteres.' });
  try {
    await ensureAssistantTables();
    const faqRows = await query('SELECT pregunta, categoria, palabras_clave FROM assistant_faq WHERE activa = TRUE');
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : [];
    const previousUser = [...history].reverse().find((message) => message?.role === 'user' && typeof message.text === 'string');
    const previousAssistant = [...history].reverse().find((message) => message?.role === 'assistant' && typeof message.text === 'string');
    const inheritedIntent = (previousUser && pickIntent(normalize(previousUser.text), faqRows))
      || (previousAssistant && normalize(previousAssistant.text).startsWith('programacion') ? 'programacion' : null);
    const result = await answer(question, faqRows, inheritedIntent, req);
    res.json(typeof result === 'string' ? { response: result } : result);
  } catch (error) {
    console.error('Error al responder desde Zoom TV Assistant:', error);
    res.status(500).json({ error: 'No pude consultar la información ahora. Inténtalo de nuevo en un momento.' });
  }
});

router.get('/knowledge', async (_req, res) => {
  try {
    await ensureAssistantTables();
    const rows = await query('SELECT id, pregunta, categoria, palabras_clave, respuesta FROM assistant_faq WHERE activa = TRUE ORDER BY categoria, id');
    res.json(rows);
  } catch (error) {
    console.error('Error al cargar preguntas del asistente:', error);
    res.status(500).json({ error: 'No se pudo cargar el conocimiento del asistente.' });
  }
});

module.exports = router;
