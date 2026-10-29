// Configuración del Chatbot Zoom TV
export const CHATBOT_CONFIG = {
  // Mensajes del sistema
  MESSAGES: {
    WELCOME: "¡Hola! Soy el asistente de Zoom TV. ¿En qué puedo ayudarte hoy?",
    ERROR: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
    LOADING: "Escribiendo...",
    PLACEHOLDER: "Escribe tu mensaje...",
    SEND_BUTTON: "Enviar",
    SEND_LOADING: "...",
    ONLINE_STATUS: "Online",
    CHAT_TITLE: "Zoom TV Assistant",
    FALLBACK:
      "No tengo una respuesta puntual para eso, pero puedo contarte sobre nuestra programación, noticias, transmisión en vivo o cómo contactarnos. ¿Sobre qué te gustaría saber?"
  },

  // Configuración de la interfaz
  UI: {
    MAX_MESSAGE_WIDTH: '18rem',
    MESSAGE_PADDING: '0.75rem',
    FONT_SIZE: '0.875rem',
    BORDER_RADIUS: '0.5rem',
    ANIMATION_DURATION: '0.3s'
  },

  // Configuración de colores (para referencia)
  COLORS: {
    PRIMARY_RED: '#e50914',
    DARK_RED: '#b2070f',
    BLACK: '#000000',
    DARK_GRAY: '#141414',
    MEDIUM_GRAY: '#333333',
    LIGHT_GRAY: '#e5e5e5',
    WHITE: '#ffffff'
  }
};

// Respuestas predefinidas basadas en palabras clave (sin API externa)
const KEYWORD_RESPONSES = [
  {
    keywords: ['programa', 'programacion', 'programación', 'horario'],
    response:
      'Puedes consultar toda nuestra programación semanal, día por día, en la sección "Programación" del menú.'
  },
  {
    keywords: ['noticia', 'actualidad', 'nacional', 'regional'],
    response:
      'Tenemos noticias de Actualidad, Nacionales y Regionales actualizadas en la sección "Actualidad" del sitio.'
  },
  {
    keywords: ['deporte', 'futbol', 'fútbol'],
    response: 'Sigue toda la información deportiva en la sección "Deportes".'
  },
  {
    keywords: ['musica', 'música', 'concierto'],
    response: 'Encuentra noticias sobre música y espectáculos en la sección "Música".'
  },
  {
    keywords: ['vivo', 'en vivo', 'live', 'transmision', 'transmisión', 'stream'],
    response: 'Puedes ver nuestra transmisión en vivo las 24 horas desde la sección "En Vivo".'
  },
  {
    keywords: ['anunciante', 'publicidad', 'auspiciador', 'patrocinador'],
    response:
      'Conoce a nuestros anunciantes y aliados comerciales en la sección "Anunciantes".'
  },
  {
    keywords: ['contacto', 'telefono', 'teléfono', 'correo', 'email'],
    response:
      'Puedes contactarnos desde la sección "Nosotros", donde encontrarás nuestro correo y teléfono.'
  },
  {
    keywords: ['hola', 'buenas', 'buenos dias', 'buenos días', 'buenas tardes'],
    response: '¡Hola! ¿En qué puedo ayudarte hoy?'
  },
  {
    keywords: ['gracias'],
    response: '¡De nada! Estoy para ayudarte.'
  }
];

// Genera una respuesta local basada en palabras clave, sin usar ninguna API externa
export const getLocalResponse = (userMessage) => {
  const normalized = userMessage
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  for (const entry of KEYWORD_RESPONSES) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword.normalize('NFD').replace(/[̀-ͯ]/g, '')))) {
      return entry.response;
    }
  }

  return CHATBOT_CONFIG.MESSAGES.FALLBACK;
};
