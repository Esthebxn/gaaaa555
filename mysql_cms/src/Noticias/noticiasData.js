// Datos de ejemplo para el CMS (sin conexión a ninguna API externa)
const noticiasData = [
  {
    id: 1,
    titulo: '🚧 Intervendrán 27 puntos críticos de la Carretera Central desde este lunes',
    contenido:
      'El Ministerio de Transportes y Comunicaciones (MTC) informó que se intervendrán 27 puntos críticos en la Carretera Central para garantizar la seguridad vial durante la temporada de lluvias. Estas labores incluirán la estabilización de taludes, limpieza de derrumbes y mejoramiento de la capa asfáltica.',
    resumen:
      'El MTC informó que se intervendrán 27 puntos críticos en la Carretera Central para garantizar la seguridad vial durante la temporada de lluvias.',
    categoria: 'Nacionales',
    autor: 'Redacción ZoomTV',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: true,
    activa: true,
    descripcion:
      'El MTC informó que se intervendrán 27 puntos críticos en la Carretera Central para garantizar la seguridad vial durante la temporada de lluvias.',
    imagen: 'carretera_central.jpg',
    fecha: '03 octubre 2025',
    fuente: 'Andina.pe'
  },
  {
    id: 2,
    titulo: 'Gobierno anuncia nuevo plan de reactivación económica',
    contenido:
      'El gobierno peruano presentó un ambicioso plan de reactivación económica que incluye inversiones por más de 5 mil millones de soles en infraestructura, educación y salud.',
    resumen:
      'El gobierno peruano presentó un ambicioso plan de reactivación económica que incluye inversiones por más de 5 mil millones de soles.',
    categoria: 'Nacionales',
    autor: 'Redacción ZoomTV',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: true,
    activa: true,
    descripcion:
      'El gobierno peruano presentó un ambicioso plan de reactivación económica que incluye inversiones en infraestructura, educación y salud.',
    imagen: 'reactivacion_economica.jpg',
    fecha: '04 octubre 2025',
    fuente: 'El Peruano'
  },
  {
    id: 3,
    titulo: 'Gobierno Regional de Lima inaugura nuevo hospital en Huaral',
    contenido:
      'El Gobierno Regional de Lima inauguró un nuevo hospital de 200 camas en Huaral que beneficiará a más de 150,000 habitantes de la zona norte de Lima.',
    resumen:
      'El Gobierno Regional de Lima inauguró un nuevo hospital de 200 camas en Huaral que beneficiará a más de 150,000 habitantes.',
    categoria: 'Regionales',
    autor: 'Corresponsal Regional',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: true,
    activa: true,
    descripcion:
      'El Gobierno Regional de Lima inauguró un nuevo hospital de 200 camas en Huaral que beneficiará a más de 150,000 habitantes.',
    imagen: 'hospital_huaral.jpg',
    fecha: '04 octubre 2025',
    fuente: 'Gobierno Regional de Lima'
  },
  {
    id: 4,
    titulo: 'Cusco implementa programa de turismo sostenible',
    contenido:
      'La región Cusco implementó un programa de turismo sostenible que incluye la capacitación de 500 guías turísticos en conservación ambiental y turismo responsable.',
    resumen:
      'La región Cusco implementó un programa de turismo sostenible que incluye la capacitación de 500 guías turísticos.',
    categoria: 'Regionales',
    autor: 'Reportero de Turismo',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: false,
    activa: true,
    descripcion:
      'La región Cusco implementó un programa de turismo sostenible que incluye la capacitación de 500 guías turísticos.',
    imagen: 'turismo_cusco.jpg',
    fecha: '04 octubre 2025',
    fuente: 'Gobierno Regional de Cusco'
  },
  {
    id: 5,
    titulo: '⚽ Perú derrota 2-0 a Ecuador en amistoso internacional',
    contenido:
      'Perú venció a Ecuador 2-0 en un amistoso jugado en Lima. Lapadula abrió el marcador al minuto 23 tras una gran jugada colectiva, mientras que Cueva cerró el encuentro con un golazo desde fuera del área.',
    resumen:
      'Perú venció a Ecuador 2-0 en un amistoso jugado en Lima. Lapadula abrió el marcador al minuto 23.',
    categoria: 'Deportes',
    autor: 'Reportero Deportivo',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: false,
    activa: true,
    descripcion:
      'Perú venció a Ecuador 2-0 en un amistoso jugado en Lima. Lapadula abrió el marcador al minuto 23.',
    imagen: 'peru_ecuador.jpg',
    fecha: '03 octubre 2025',
    fuente: 'Depor.pe'
  },
  {
    id: 6,
    titulo: 'Universitario de Deportes clasifica a la final de la Copa Libertadores',
    contenido:
      'Universitario de Deportes logró clasificar a la final de la Copa Libertadores tras vencer 2-1 al Flamengo en el Monumental. Los goles fueron anotados por Valera y Rivera.',
    resumen:
      'Universitario de Deportes logró clasificar a la final de la Copa Libertadores tras vencer 2-1 al Flamengo.',
    categoria: 'Deportes',
    autor: 'Reportero Deportivo',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: true,
    activa: true,
    descripcion:
      'Universitario de Deportes logró clasificar a la final de la Copa Libertadores tras vencer 2-1 al Flamengo en el Monumental.',
    imagen: 'universitario_libertadores.jpg',
    fecha: '04 octubre 2025',
    fuente: 'Fútbol Peruano'
  },
  {
    id: 7,
    titulo: 'Gian Marco presenta su nuevo álbum "Raíces"',
    contenido:
      'El cantautor peruano Gian Marco presentó su nuevo álbum "Raíces" que incluye 12 canciones inéditas. El disco fusiona ritmos peruanos con sonidos contemporáneos.',
    resumen:
      'El cantautor peruano Gian Marco presentó su nuevo álbum "Raíces" que incluye 12 canciones inéditas.',
    categoria: 'Música',
    autor: 'Reportero Musical',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: true,
    activa: true,
    descripcion:
      'El cantautor peruano Gian Marco presentó su nuevo álbum "Raíces" que incluye 12 canciones inéditas.',
    imagen: 'gian_marco_raices.jpg',
    fecha: '04 octubre 2025',
    fuente: 'ZoomTV Música'
  },
  {
    id: 8,
    titulo: 'Festival de Rock en Lima reúne a 50,000 espectadores',
    contenido:
      'El Festival de Rock en Lima reunió a 50,000 espectadores en el Estadio Nacional con la participación de bandas nacionales e internacionales.',
    resumen:
      'El Festival de Rock en Lima reunió a 50,000 espectadores en el Estadio Nacional.',
    categoria: 'Música',
    autor: 'Corresponsal Musical',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: false,
    activa: true,
    descripcion:
      'El Festival de Rock en Lima reunió a 50,000 espectadores en el Estadio Nacional con la participación de bandas nacionales e internacionales.',
    imagen: 'festival_rock.jpg',
    fecha: '04 octubre 2025',
    fuente: 'Festival de Rock Lima'
  },
  {
    id: 9,
    titulo: 'Zoom TV Canal 10 estrena nueva señal en alta definición',
    contenido:
      'Zoom TV Canal 10 anunció el lanzamiento de su nueva señal en alta definición, que llegará a toda la región con mejor calidad de imagen y sonido para sus televidentes.',
    resumen:
      'Zoom TV Canal 10 anunció el lanzamiento de su nueva señal en alta definición.',
    categoria: 'Actualidad',
    autor: 'Redacción ZoomTV',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: true,
    activa: true,
    descripcion:
      'Zoom TV Canal 10 anunció el lanzamiento de su nueva señal en alta definición, que llegará a toda la región.',
    imagen: 'zoomtv_hd.jpg',
    fecha: '04 octubre 2025',
    fuente: 'Redacción ZoomTV'
  },
  {
    id: 10,
    titulo: 'Municipalidad y Zoom TV firman convenio de difusión comunitaria',
    contenido:
      'La municipalidad local firmó un convenio con Zoom TV Canal 10 para difundir campañas de salud, educación y seguridad ciudadana dirigidas a toda la comunidad.',
    resumen:
      'La municipalidad local firmó un convenio con Zoom TV Canal 10 para difundir campañas comunitarias.',
    categoria: 'Actualidad',
    autor: 'Redacción ZoomTV',
    imagen_url: '',
    fecha_publicacion: '',
    destacada: false,
    activa: true,
    descripcion:
      'La municipalidad local firmó un convenio con Zoom TV Canal 10 para difundir campañas de salud, educación y seguridad ciudadana.',
    imagen: 'convenio_municipalidad.jpg',
    fecha: '04 octubre 2025',
    fuente: 'Redacción ZoomTV'
  }
];

export default noticiasData;
