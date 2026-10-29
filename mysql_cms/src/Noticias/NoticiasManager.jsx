import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Tag,
  Star,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";

import { API_URL, noticiasApi, uploadImage } from "../services/api";
import noticiasSeed from "./noticiasData";
import SidePanel from "../SidePanel/SidePanel";

import "./NoticiasManager.css";


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const API_BASE = API_URL.replace(/\/api\/?$/, "");


/* =========================================================
   CATEGORÍAS
========================================================= */

const CATEGORIAS = [
  "Actualidad",
  "Deportes",
  "Música",
  "Nacionales",
  "Regionales",
];


/* =========================================================
   SECCIONES
========================================================= */

const SECCIONES_DASHBOARD = [
  {
    nombre: "Actualidad",
    tipo: "noticias",
    categoria: "Actualidad",
    aliases: [
      "actualidad",
      "actual",
      "ultimas noticias",
      "últimas noticias",
    ],
  },

  {
    nombre: "Deportes",
    tipo: "noticias",
    categoria: "Deportes",
    aliases: [
      "deportes",
      "deporte",
      "sport",
    ],
  },

  {
    nombre: "Música",
    tipo: "noticias",
    categoria: "Música",
    aliases: [
      "musica",
      "música",
      "musical",
    ],
  },

  {
    nombre: "Nacionales",
    tipo: "noticias",
    categoria: "Nacionales",
    aliases: [
      "nacionales",
      "nacional",
    ],
  },

  {
    nombre: "Regionales",
    tipo: "noticias",
    categoria: "Regionales",
    aliases: [
      "regionales",
      "regional",
      "region",
      "región",
    ],
  },

  {
    nombre: "Programación",
    tipo: "ruta",
    ruta: "/programacion",
    aliases: [
      "programacion",
      "programación",
      "programa",
      "horarios",
    ],
  },

  {
    nombre: "Anunciantes",
    tipo: "ruta",
    ruta: "/anunciantes",
    aliases: [
      "anunciantes",
      "anunciante",
      "publicidad",
    ],
  },

  {
    nombre: "Nosotros",
    tipo: "ruta",
    ruta: "/nosotros",
    aliases: [
      "nosotros",
      "empresa",
      "quienes somos",
    ],
  },

  {
    nombre: "Live Stream",
    tipo: "ruta",
    ruta: "/live-stream",
    aliases: [
      "live",
      "live stream",
      "livestream",
      "transmision",
      "transmisión",
      "en vivo",
    ],
  },
];


/* =========================================================
   FORMULARIO
========================================================= */

const FORM_INICIAL = {
  titulo: "",
  contenido: "",
  resumen: "",
  categoria: "",
  autor: "",
  fecha_publicacion: "",
  destacada: false,
  activa: true,
  descripcion: "",
  imagen: "",
  fecha: "",
  fuente: "",
};


/* =========================================================
   NORMALIZAR TEXTO
========================================================= */

const normalizarTexto = (
  texto = ""
) => {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim();
};


/* =========================================================
   LIMPIAR NOMBRE DE IMAGEN
========================================================= */

const limpiarNombreImagen = (
  valor = ""
) => {

  let archivo =
    String(valor).trim();

  if (!archivo) {
    return "";
  }

  /*
    Solo aceptamos nombres locales.
    No se aceptan URLs.
  */

  if (
    archivo.startsWith(
      "http://"
    ) ||
    archivo.startsWith(
      "https://"
    ) ||
    archivo.startsWith("//") ||
    archivo.startsWith(
      "data:"
    )
  ) {
    return "";
  }

  /*
    Quitar rutas.
  */

  archivo = archivo
    .replace(
      /^.*[\\/]/,
      ""
    )
    .trim();

  /*
    Extensiones permitidas.
  */

  const extensionValida =
    /\.(jpg|jpeg|png|gif|webp|svg)$/i;

  if (
    !extensionValida.test(
      archivo
    )
  ) {
    return "";
  }

  return archivo;
};


/* =========================================================
   OBTENER URL DE IMAGEN LOCAL
========================================================= */

const obtenerImagenLocal = (
  noticia
) => {

  if (!noticia) {
    return "";
  }

  if (noticia.imagen_url && (
    noticia.imagen_url.startsWith("http://") ||
    noticia.imagen_url.startsWith("https://") ||
    noticia.imagen_url.startsWith("blob:") ||
    noticia.imagen_url.startsWith("data:")
  )) {
    return noticia.imagen_url;
  }

  const archivo =
    limpiarNombreImagen(
      noticia.imagen
    ) || noticia.imagen;

  if (!archivo) {
    return "";
  }

  return `${API_BASE}/uploads/${encodeURIComponent(
    archivo
  )}`;
};


/* =========================================================
   FECHA INPUT
========================================================= */

const convertirFechaInput = (
  fecha
) => {

  if (!fecha) {
    return "";
  }

  const valor =
    String(fecha);

  const match =
    valor.match(
      /^(\d{4}-\d{2}-\d{2})/
    );

  return match
    ? match[1]
    : "";
};


/* =========================================================
   FECHA MYSQL
========================================================= */

const prepararFechaMySQL = (
  fecha
) => {

  if (!fecha) {
    return null;
  }

  const valor =
    String(fecha).trim();

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      valor
    )
  ) {
    return `${valor} 00:00:00`;
  }

  if (
    /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(
      valor
    )
  ) {
    return valor;
  }

  return null;
};


/* =========================================================
   CATEGORÍAS
========================================================= */

const categoriaCoincide = (
  categoriaBD,
  categoriaSeleccionada
) => {

  const bd =
    normalizarTexto(
      categoriaBD
    );

  const seleccionada =
    normalizarTexto(
      categoriaSeleccionada
    );

  /*
    Vacío = todas.
  */

  if (!seleccionada) {
    return true;
  }

  /*
    Actualidad muestra todas.
  */

  if (
    seleccionada ===
    "actualidad"
  ) {
    return true;
  }

  const equivalencias = {

    deportes: [
      "deporte",
      "deportes",
    ],

    musica: [
      "musica",
      "musicas",
    ],

    nacionales: [
      "nacional",
      "nacionales",
    ],

    regionales: [
      "regional",
      "regionales",
    ],

  };

  const grupo =
    equivalencias[
      seleccionada
    ];

  if (grupo) {
    return grupo.includes(
      bd
    );
  }

  return (
    bd ===
    seleccionada
  );
};


/* =========================================================
   OBTENER NOMBRE DEL ARCHIVO DESDE RESPUESTA DEL SERVIDOR
========================================================= */

const obtenerNombreSubido = (
  data
) => {

  if (!data) {
    return "";
  }

  /*
    Formatos posibles.
  */

  const candidatos = [
    data.filename,
    data.fileName,
    data.nombre,
    data.name,
    data.imagen,
    data.file,
    data.path,
    data.url,
    data.file?.filename,
    data.file?.name,
    data.data?.filename,
    data.data?.fileName,
    data.data?.imagen,
    data.data?.path,
    data.data?.url,
  ];

  for (
    const candidato of candidatos
  ) {

    if (
      typeof candidato !==
      "string"
    ) {
      continue;
    }

    const limpio =
      candidato
        .trim()
        .replace(
          /^.*[\\/]/,
          ""
        );

    if (
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
        limpio
      )
    ) {
      return limpio;
    }
  }

  return "";
};


const LOCAL_STORAGE_NOTICIAS_KEY = "zoomtv_cms_noticias";

const obtenerNoticiasIniciales = () => {
  try {
    const dataGuardada = localStorage.getItem(LOCAL_STORAGE_NOTICIAS_KEY);
    if (dataGuardada) {
      const parsed = JSON.parse(dataGuardada);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("No se pudieron leer noticias de localStorage:", err);
  }
  return noticiasSeed;
};

const guardarNoticiasEnLocal = (items) => {
  try {
    if (Array.isArray(items)) {
      localStorage.setItem(LOCAL_STORAGE_NOTICIAS_KEY, JSON.stringify(items));
    }
  } catch (err) {
    console.warn("No se pudieron guardar noticias en localStorage:", err);
  }
};

/* =========================================================
   COMPONENTE
========================================================= */

const NoticiasManager = ({
  categoriaInicial = "Actualidad",
}) => {

  /* =======================================================
     ESTADOS
  ======================================================= */

  const [
    seccionActual,
    setSeccionActual,
  ] = useState(
    categoriaInicial ||
      "Actualidad"
  );


  const [
    filterCategoria,
    setFilterCategoria,
  ] = useState(
    categoriaInicial ===
      "Actualidad"
      ? ""
      : categoriaInicial
  );


  const [
    noticias,
    setNoticias,
  ] = useState(obtenerNoticiasIniciales);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    showModal,
    setShowModal,
  ] = useState(false);


  const [
    editingNoticia,
    setEditingNoticia,
  ] = useState(null);


  const [
    viewingNoticia,
    setViewingNoticia,
  ] = useState(null);


  const [
    formData,
    setFormData,
  ] = useState(
    FORM_INICIAL
  );


  /*
    Archivo seleccionado.
  */

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);


  /*
    Vista previa de la imagen.
  */

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState("");


  /*
    Estado de subida.
  */

  const [
    subiendoImagen,
    setSubiendoImagen,
  ] = useState(false);


  /*
    Error de subida.
  */

  const [
    errorImagen,
    setErrorImagen,
  ] = useState("");


  /* =======================================================
     SINCRONIZAR SECCIÓN
  ======================================================= */

  useEffect(() => {

    const seccion =
      categoriaInicial ||
      "Actualidad";

    setSeccionActual(
      seccion
    );

    setFilterCategoria(
      seccion ===
        "Actualidad"
        ? ""
        : seccion
    );

    setSearchTerm("");

  }, [
    categoriaInicial,
  ]);


  /* =======================================================
     LIMPIAR PREVIEW
  ======================================================= */

  useEffect(() => {

    return () => {

      if (
        previewUrl &&
        previewUrl.startsWith(
          "blob:"
        )
      ) {

        URL.revokeObjectURL(
          previewUrl
        );
      }

    };

  }, [
    previewUrl,
  ]);


  /* =======================================================
     CARGAR
  ======================================================= */

  useEffect(() => {
    cargarNoticias();
  }, []);


  const cargarNoticias =
    async () => {

      try {

        setLoading(true);

        const data =
          await noticiasApi.list();

        if (Array.isArray(data) && data.length > 0) {
          setNoticias(data);
          guardarNoticiasEnLocal(data);
        } else if (Array.isArray(data)) {
          setNoticias(data);
          guardarNoticiasEnLocal(data);
        }

      } catch (error) {

        console.warn(
          "No se pudo conectar con el servidor de la API, manteniendo datos locales:",
          error
        );

        setNoticias((prev) => (prev && prev.length > 0 ? prev : obtenerNoticiasIniciales()));

      } finally {

        setLoading(false);

      }
    };


  /* =======================================================
     BUSCAR SECCIONES
  ======================================================= */

  const seccionesEncontradas =
    useMemo(() => {

      const texto =
        normalizarTexto(
          searchTerm
        );

      if (!texto) {
        return [];
      }

      return SECCIONES_DASHBOARD.filter(
        (seccion) => {

          const nombre =
            normalizarTexto(
              seccion.nombre
            );

          if (
            nombre.includes(
              texto
            )
          ) {
            return true;
          }

          return seccion.aliases.some(
            (alias) =>
              normalizarTexto(
                alias
              ).includes(
                texto
              )
          );
        }
      );

    }, [
      searchTerm,
    ]);


  /* =======================================================
     CAMBIAR SECCIÓN
  ======================================================= */

  const cambiarSeccion = (
    seccion
  ) => {

    if (
      seccion.tipo ===
      "noticias"
    ) {

      setSeccionActual(
        seccion.nombre
      );

      setFilterCategoria(
        seccion.nombre ===
          "Actualidad"
          ? ""
          : seccion.categoria
      );

      setSearchTerm("");

      return;
    }


    if (
      seccion.ruta
    ) {

      window.location.href =
        seccion.ruta;
    }
  };


  /* =======================================================
     BUSCADOR ENTER
  ======================================================= */

  const handleSearchKeyDown =
    (event) => {

      if (
        event.key !==
        "Enter"
      ) {
        return;
      }

      if (
        seccionesEncontradas.length >
        0
      ) {

        cambiarSeccion(
          seccionesEncontradas[0]
        );
      }
    };


  /* =======================================================
     SELECCIONAR ARCHIVO
  ======================================================= */

  const handleFileChange =
    async (
      event
    ) => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }


      setErrorImagen("");


      /*
        Validar tipo.
      */

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        setErrorImagen(
          "Selecciona un archivo de imagen válido."
        );

        event.target.value =
          "";

        return;
      }


      /*
        Máximo 5 MB.
      */

      if (
        file.size >
        5 * 1024 * 1024
      ) {

        setErrorImagen(
          "La imagen no debe superar los 5 MB."
        );

        event.target.value =
          "";

        return;
      }


      /*
        Guardar archivo.
      */

      setSelectedFile(
        file
      );


      /*
        Vista previa local.
      */

      const objectUrl =
        URL.createObjectURL(
          file
        );

      setPreviewUrl(
        objectUrl
      );


      /*
        Subir inmediatamente.
      */

      await subirImagen(
        file
      );
    };


  /* =======================================================
     SUBIR IMAGEN
  ======================================================= */

  const subirImagen =
    async (
      file
    ) => {

      try {

        setSubiendoImagen(
          true
        );

        setErrorImagen("");


        let nombreArchivo = "";
        try {
          const respuesta = await uploadImage(file);
          nombreArchivo = obtenerNombreSubido(respuesta);
        } catch (uploadErr) {
          console.warn("Servidor de subida no disponible, usando nombre local:", uploadErr);
          nombreArchivo = file.name;
        }

        if (!nombreArchivo) {
          nombreArchivo = file.name;
        }

        /*
          Guardar nombre en formulario.
        */

        setFormData(
          (prev) => ({
            ...prev,
            imagen:
              nombreArchivo,
          })
        );


      } catch (error) {

        console.error(
          "Error subiendo imagen:",
          error
        );


        setErrorImagen(
          error?.message ||
          "No se pudo subir la imagen."
        );


        setSelectedFile(
          null
        );


      } finally {

        setSubiendoImagen(
          false
        );
      }
    };


  /* =======================================================
     QUITAR IMAGEN SELECCIONADA
  ======================================================= */

  const quitarImagen =
    () => {

      setSelectedFile(
        null
      );

      setErrorImagen("");


      setFormData(
        (prev) => ({
          ...prev,
          imagen: "",
        })
      );


      if (
        previewUrl &&
        previewUrl.startsWith(
          "blob:"
        )
      ) {

        URL.revokeObjectURL(
          previewUrl
        );
      }


      setPreviewUrl("");
    };


  /* =======================================================
     ABRIR NUEVA
  ======================================================= */

  const abrirNuevaNoticia =
    () => {

      setEditingNoticia(
        null
      );

      setSelectedFile(
        null
      );

      setPreviewUrl("");

      setErrorImagen("");


      let categoria =
        "";


      if (
        [
          "Deportes",
          "Música",
          "Nacionales",
          "Regionales",
        ].includes(
          seccionActual
        )
      ) {

        categoria =
          seccionActual;
      }


      setFormData({
        ...FORM_INICIAL,
        categoria,
      });


      setShowModal(
        true
      );
    };


  /* =======================================================
     CERRAR
  ======================================================= */

  const cerrarModal =
    () => {

      setShowModal(
        false
      );

      setEditingNoticia(
        null
      );

      setSelectedFile(
        null
      );

      setErrorImagen("");


      setFormData(
        FORM_INICIAL
      );


      if (
        previewUrl &&
        previewUrl.startsWith(
          "blob:"
        )
      ) {

        URL.revokeObjectURL(
          previewUrl
        );
      }


      setPreviewUrl("");
    };


  /* =======================================================
     GUARDAR NOTICIA
  ======================================================= */

  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault();


      if (
        subiendoImagen
      ) {

        alert(
          "Espera a que termine de subir la imagen."
        );

        return;
      }


      if (
        !formData.titulo.trim()
      ) {

        alert(
          "El título es requerido."
        );

        return;
      }


      if (
        !formData.contenido.trim()
      ) {

        alert(
          "El contenido es requerido."
        );

        return;
      }


      if (
        !formData.categoria
      ) {

        alert(
          "Selecciona una categoría."
        );

        return;
      }


      const dataToSave = {

        titulo:
          formData.titulo.trim(),

        contenido:
          formData.contenido.trim(),

        resumen:
          formData.resumen.trim(),

        categoria:
          formData.categoria,

        autor:
          formData.autor.trim() ||
          "Admin",

        /*
          Se mantiene vacío porque
          trabajamos con archivo local.
        */

        imagen_url:
          "",

        fecha_publicacion:
          prepararFechaMySQL(
            formData.fecha_publicacion
          ),

        destacada:
          Boolean(
            formData.destacada
          ),

        activa:
          Boolean(
            formData.activa
          ),

        descripcion:
          formData.descripcion.trim(),

        /*
          AQUÍ queda guardado
          el nombre del archivo
          que devolvió el backend.
        */

        imagen:
          limpiarNombreImagen(
            formData.imagen
          ),

        fecha:
          formData.fecha.trim(),

        fuente:
          formData.fuente.trim(),
      };


      try {

        let resultado;


        try {
          if (
            editingNoticia
          ) {

            resultado =
              await noticiasApi.update(
                editingNoticia.id,
                dataToSave
              );

          } else {

            resultado =
              await noticiasApi.create(
                dataToSave
              );
          }
        } catch (apiError) {
          console.warn("API no disponible, guardando noticia localmente:", apiError);
          if (editingNoticia) {
            resultado = { ...editingNoticia, ...dataToSave };
          } else {
            resultado = { id: Date.now(), ...dataToSave };
          }
        }


        /*
          Actualizar lista.
        */

        if (
          resultado &&
          resultado.id
        ) {

          if (
            editingNoticia
          ) {

            setNoticias(
              (prev) => {
                const actualizadas = prev.map(
                  (item) =>
                    item.id ===
                    editingNoticia.id
                      ? resultado
                      : item
                );
                guardarNoticiasEnLocal(actualizadas);
                return actualizadas;
              }
            );

          } else {

            setNoticias(
              (prev) => {
                const actualizadas = [
                  resultado,
                  ...prev,
                ];
                guardarNoticiasEnLocal(actualizadas);
                return actualizadas;
              }
            );
          }

        } else {

          /*
            Volver a leer desde MySQL.
          */

          await cargarNoticias();
        }


        alert(
          editingNoticia
            ? "Noticia actualizada correctamente."
            : "Noticia creada correctamente."
        );


        cerrarModal();


      } catch (error) {

        console.error(
          "Error guardando noticia:",
          error
        );


        console.error(
          "Respuesta:",
          error?.response?.data
        );


        alert(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "No se pudo guardar la noticia."
        );
      }
    };


  /* =======================================================
     EDITAR
  ======================================================= */

  const handleEdit =
    (noticia) => {

      setEditingNoticia(
        noticia
      );


      setSelectedFile(
        null
      );

      setErrorImagen("");


      /*
        Si ya tiene una imagen local,
        mostrarla.
      */

      const imagenUrl =
        obtenerImagenLocal(
          noticia
        );


      setPreviewUrl(
        imagenUrl
      );


      setFormData({

        titulo:
          noticia.titulo ||
          "",

        contenido:
          noticia.contenido ||
          "",

        resumen:
          noticia.resumen ||
          "",

        categoria:
          noticia.categoria ||
          "",

        autor:
          noticia.autor ||
          "",

        fecha_publicacion:
          convertirFechaInput(
            noticia.fecha_publicacion
          ),

        destacada:
          Boolean(
            noticia.destacada
          ),

        activa:
          noticia.activa !==
            false &&
          noticia.activa !==
            0,

        descripcion:
          noticia.descripcion ||
          "",

        /*
          Solo el archivo local.
        */

        imagen:
          limpiarNombreImagen(
            noticia.imagen
          ),

        fecha:
          noticia.fecha ||
          "",

        fuente:
          noticia.fuente ||
          "",
      });


      setShowModal(
        true
      );
    };


  /* =======================================================
     ELIMINAR
  ======================================================= */

  const handleDelete =
    async (
      id
    ) => {

      const confirmar =
        window.confirm(
          "¿Eliminar esta noticia?"
        );


      if (!confirmar) {
        return;
      }


      try {

        try {
          await noticiasApi.remove(
            id
          );
        } catch (apiError) {
          console.warn("API no disponible, eliminando noticia localmente:", apiError);
        }


        setNoticias(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !== id
            )
        );


        if (
          viewingNoticia?.id ===
          id
        ) {

          setViewingNoticia(
            null
          );
        }


        alert(
          "Noticia eliminada correctamente."
        );


      } catch (error) {

        console.error(
          "Error eliminando:",
          error
        );


        alert(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "No se pudo eliminar la noticia."
        );
      }
    };


  /* =======================================================
     FILTRAR
  ======================================================= */

  const noticiasFiltradas =
    useMemo(() => {

      const texto =
        normalizarTexto(
          searchTerm
        );


      const buscandoSeccion =
        seccionesEncontradas.length >
        0;


      return noticias.filter(
        (noticia) => {

          const textoNoticia =
            normalizarTexto(
              [
                noticia.titulo,
                noticia.contenido,
                noticia.resumen,
                noticia.descripcion,
                noticia.categoria,
                noticia.autor,
                noticia.fuente,
              ]
                .filter(Boolean)
                .join(" ")
            );


          const coincideTexto =
            !texto ||
            buscandoSeccion ||
            textoNoticia.includes(
              texto
            );


          const coincideCategoria =
            categoriaCoincide(
              noticia.categoria,
              filterCategoria
            );


          return (
            coincideTexto &&
            coincideCategoria
          );
        }
      );

    }, [
      noticias,
      searchTerm,
      filterCategoria,
      seccionesEncontradas,
    ]);


  /* =======================================================
     PRINCIPAL / SECUNDARIAS
  ======================================================= */

  const noticiaPrincipal =
    noticiasFiltradas[0];


  const noticiasSecundarias =
    noticiasFiltradas.slice(
      1
    );


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <div className="manager-container noticias-loading">

        <div className="loading-spinner"></div>

        <p>
          Cargando noticias...
        </p>

      </div>
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <motion.div
      className="manager-container"

      initial={{
        opacity: 0,
        y: 15,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}
    >

      {/* =================================================
          FILTROS
      ================================================= */}

      <div className="filters-section">

        <div className="search-box">

          <Search
            className="search-icon"
            size={18}
          />


          <input
            type="text"

            className="search-input"

            value={
              searchTerm
            }

            placeholder="Buscar sección o noticia..."

            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }

            onKeyDown={
              handleSearchKeyDown
            }
          />


          {searchTerm &&
            seccionesEncontradas.length >
              0 && (

            <div className="section-search-results">

              <div className="section-results-title">
                SECCIONES
              </div>


              {seccionesEncontradas.map(
                (seccion) => (

                  <button
                    key={
                      seccion.nombre
                    }

                    type="button"

                    className="section-result"

                    onClick={() =>
                      cambiarSeccion(
                        seccion
                      )
                    }
                  >

                    <span>
                      {
                        seccion.nombre
                      }
                    </span>


                    <small>
                      {
                        seccion.tipo ===
                        "noticias"
                          ? "Actualizar"
                          : "Ir"
                      }
                    </small>

                  </button>

                )
              )}

            </div>

          )}

        </div>


        {/* FILTRO */}

        <div className="filter-select">

          <Filter
            className="filter-icon"
            size={17}
          />


          <select

            className="select-input"

            value={
              filterCategoria
            }

            onChange={(event) => {

              const valor =
                event.target.value;


              if (
                valor === ""
              ) {

                setSeccionActual(
                  "Actualidad"
                );

                setFilterCategoria(
                  ""
                );

              } else {

                setSeccionActual(
                  valor
                );

                setFilterCategoria(
                  valor
                );
              }

            }}
          >

            <option value="">
              Actualidad — Todas
            </option>


            <option value="Deportes">
              Deportes
            </option>


            <option value="Música">
              Música
            </option>


            <option value="Nacionales">
              Nacionales
            </option>


            <option value="Regionales">
              Regionales
            </option>

          </select>

        </div>


        <div className="filter-info">

          Total:{" "}

          {
            noticiasFiltradas.length
          }

        </div>

      </div>


      {/* =================================================
          TÍTULO
      ================================================= */}

      <div className="section-toolbar">

        <div className="section-heading">

          <div className="section-heading-line"></div>


          <h1>
            {
              seccionActual
            }
          </h1>


          <div className="section-heading-line"></div>

        </div>


        <button
          type="button"

          className="new-news-button"

          onClick={
            abrirNuevaNoticia
          }

          title="Nueva noticia"
        >

          <Plus
            size={19}
          />

        </button>

      </div>


      {/* =================================================
          SIN NOTICIAS
      ================================================= */}

      {noticiasFiltradas.length ===
      0 ? (

        <div className="empty-state">

          <div className="empty-icon">

            <Eye
              size={32}
            />

          </div>


          <h3>
            {
              seccionActual
            }
          </h3>


          <p>
            No hay noticias registradas
            en esta sección.
          </p>


          <button
            type="button"

            className="empty-new-button"

            onClick={
              abrirNuevaNoticia
            }
          >

            <Plus
              size={16}
            />

            Agregar noticia

          </button>

        </div>

      ) : (

        <>

          {/* =================================================
              NOTICIA PRINCIPAL
          ================================================= */}

          <div className="featured-news">

            <div className="featured-image">

              {obtenerImagenLocal(
                noticiaPrincipal
              ) ? (

                <img

                  src={
                    obtenerImagenLocal(
                      noticiaPrincipal
                    )
                  }

                  alt={
                    noticiaPrincipal.titulo
                  }

                  onError={(event) => {

                    event.currentTarget.style.display =
                      "none";

                  }}

                />

              ) : (

                <div className="image-placeholder">

                  <ImageIcon
                    size={28}
                  />

                  <span>
                    Sin imagen
                  </span>

                </div>

              )}

            </div>


            <div className="featured-content">

              <div className="news-category">

                <Tag
                  size={14}
                />

                {
                  noticiaPrincipal.categoria
                }

              </div>


              <h2>

                {
                  noticiaPrincipal.titulo
                }

              </h2>


              <p className="featured-description">

                {
                  noticiaPrincipal.resumen ||
                  noticiaPrincipal.descripcion ||
                  noticiaPrincipal.contenido
                }

              </p>


              <div className="news-meta">

                <span>

                  <Calendar
                    size={14}
                  />

                  {
                    noticiaPrincipal.fecha ||
                    "Sin fecha"
                  }

                </span>


                <span>

                  {
                    noticiaPrincipal.fuente ||
                    noticiaPrincipal.autor ||
                    "Redacción ZoomTV"
                  }

                </span>

              </div>


              <div className="news-actions">

                <button
                  type="button"

                  className="action-btn edit"

                  onClick={() =>
                    handleEdit(
                      noticiaPrincipal
                    )
                  }

                  title="Editar"
                >

                  <Edit
                    size={17}
                  />

                </button>


                <button
                  type="button"

                  className="action-btn delete"

                  onClick={() =>
                    handleDelete(
                      noticiaPrincipal.id
                    )
                  }

                  title="Eliminar"
                >

                  <Trash2
                    size={17}
                  />

                </button>


                <button
                  type="button"

                  className="action-btn view"

                  onClick={() =>
                    setViewingNoticia(
                      noticiaPrincipal
                    )
                  }

                  title="Ver"
                >

                  <Eye
                    size={17}
                  />

                </button>

              </div>

            </div>

          </div>


          {/* =================================================
              SECUNDARIAS
          ================================================= */}

          {noticiasSecundarias.length >
            0 && (

            <div className="secondary-news-grid">

              {noticiasSecundarias.map(
                (
                  noticia,
                  index
                ) => (

                  <motion.article

                    key={
                      noticia.id
                    }

                    className="secondary-news"

                    initial={{
                      opacity: 0,
                      y: 15,
                    }}

                    animate={{
                      opacity: 1,
                      y: 0,
                    }}

                    transition={{
                      delay:
                        index *
                        0.04,
                    }}
                  >

                    <div className="secondary-image">

                      {obtenerImagenLocal(
                        noticia
                      ) ? (

                        <img

                          src={
                            obtenerImagenLocal(
                              noticia
                            )
                          }

                          alt={
                            noticia.titulo
                          }

                          onError={(event) => {

                            event.currentTarget.style.display =
                              "none";

                          }}

                        />

                      ) : (

                        <div className="image-placeholder">

                          <ImageIcon
                            size={22}
                          />

                          <span>
                            Sin imagen
                          </span>

                        </div>

                      )}

                    </div>


                    <div className="secondary-content">

                      <div className="news-category">

                        <Tag
                          size={12}
                        />

                        {
                          noticia.categoria
                        }

                      </div>


                      <h3>

                        {
                          noticia.titulo
                        }

                      </h3>


                      <p>

                        {
                          noticia.resumen ||
                          noticia.descripcion ||
                          noticia.contenido
                        }

                      </p>


                      <div className="news-meta">

                        <span>

                          <Calendar
                            size={12}
                          />

                          {
                            noticia.fecha ||
                            "Sin fecha"
                          }

                        </span>


                        <span>

                          {
                            noticia.fuente ||
                            noticia.autor ||
                            "ZoomTV"
                          }

                        </span>

                      </div>


                      <div className="news-actions">

                        <button
                          type="button"

                          className="action-btn edit"

                          onClick={() =>
                            handleEdit(
                              noticia
                            )
                          }

                          title="Editar"
                        >

                          <Edit
                            size={15}
                          />

                        </button>


                        <button
                          type="button"

                          className="action-btn delete"

                          onClick={() =>
                            handleDelete(
                              noticia.id
                            )
                          }

                          title="Eliminar"
                        >

                          <Trash2
                            size={15}
                          />

                        </button>


                        <button
                          type="button"

                          className="action-btn view"

                          onClick={() =>
                            setViewingNoticia(
                              noticia
                            )
                          }

                          title="Ver"
                        >

                          <Eye
                            size={15}
                          />

                        </button>

                      </div>

                    </div>

                  </motion.article>

                )
              )}

            </div>

          )}

        </>

      )}


      {/* =================================================
          PANEL CREAR / EDITAR
      ================================================= */}

      <SidePanel

        isOpen={
          showModal
        }

        onClose={
          cerrarModal
        }

        title={
          editingNoticia
            ? "Editar Noticia"
            : `Nueva Noticia - ${seccionActual}`
        }

        wide
      >

        <form

          onSubmit={
            handleSubmit
          }

          className="form"

        >

          {/* =================================================
              TÍTULO
          ================================================= */}

          <div className="form-group">

            <label>
              Título
            </label>


            <input

              type="text"

              className="form-input"

              value={
                formData.titulo
              }

              onChange={(event) =>
                setFormData({
                  ...formData,
                  titulo:
                    event.target.value,
                })
              }

              required

            />

          </div>


          {/* =================================================
              CATEGORÍA
          ================================================= */}

          <div className="form-group">

            <label>
              Categoría
            </label>


            <select

              className="form-select"

              value={
                formData.categoria
              }

              onChange={(event) =>
                setFormData({
                  ...formData,
                  categoria:
                    event.target.value,
                })
              }

              required

            >

              <option value="">
                Seleccionar categoría
              </option>
              <option value="Actualidad">Actualidad</option>


              <option value="Deportes">
                Deportes
              </option>


              <option value="Música">
                Música
              </option>


              <option value="Nacionales">
                Nacionales
              </option>


              <option value="Regionales">
                Regionales
              </option>

            </select>

          </div>


          {/* =================================================
              RESUMEN
          ================================================= */}

          <div className="form-group">

            <label>
              Resumen
            </label>


            <textarea

              className="form-textarea"

              rows={3}

              value={
                formData.resumen
              }

              onChange={(event) =>
                setFormData({
                  ...formData,
                  resumen:
                    event.target.value,
                })
              }

            />

          </div>


          {/* =================================================
              CONTENIDO
          ================================================= */}

          <div className="form-group">

            <label>
              Contenido
            </label>


            <textarea

              className="form-textarea"

              rows={8}

              value={
                formData.contenido
              }

              onChange={(event) =>
                setFormData({
                  ...formData,
                  contenido:
                    event.target.value,
                })
              }

              required

            />

          </div>


          {/* =================================================
              AUTOR
          ================================================= */}

          <div className="form-group">

            <label>
              Autor
            </label>


            <input

              type="text"

              className="form-input"

              value={
                formData.autor
              }

              onChange={(event) =>
                setFormData({
                  ...formData,
                  autor:
                    event.target.value,
                })
              }

              placeholder="Redacción ZoomTV"

            />

          </div>


          {/* =================================================
              FECHA
          ================================================= */}

          <div className="form-group">

            <label>
              Fecha de publicación
            </label>


            <input

              type="date"

              className="form-input"

              value={
                formData.fecha_publicacion
              }

              onChange={(event) =>
                setFormData({
                  ...formData,
                  fecha_publicacion:
                    event.target.value,
                })
              }

            />

          </div>


          {/* =================================================
              SUBIR IMAGEN
          ================================================= */}

          <div className="form-group">

            <label>
              Imagen de la noticia
            </label>


            <div className="upload-box">

              {/* BOTÓN */}

              <label
                className="upload-button"
              >

                <Upload
                  size={18}
                />

                {subiendoImagen
                  ? "Subiendo..."
                  : "Seleccionar imagen"}

                <input

                  type="file"

                  accept="image/*"

                  onChange={
                    handleFileChange
                  }

                  disabled={
                    subiendoImagen
                  }

                  hidden

                />

              </label>


              {/* ESTADO */}

              {subiendoImagen && (

                <div className="upload-status">

                  <Loader2
                    size={17}
                    className="spin"
                  />

                  Subiendo imagen...

                </div>

              )}


              {/* ERROR */}

              {errorImagen && (

                <div className="upload-error">

                  {errorImagen}

                </div>

              )}


              {/* PREVIEW */}

              {previewUrl && (

                <div className="upload-preview">

                  <img
                    src={
                      previewUrl
                    }
                    alt="Vista previa"
                    onError={() => {
                      console.warn("Aviso de carga en vista previa:", previewUrl);
                    }}
                  />


                  <button

                    type="button"

                    className="remove-image"

                    onClick={
                      quitarImagen
                    }

                    disabled={
                      subiendoImagen
                    }

                    title="Quitar imagen"

                  >

                    <X
                      size={16}
                    />

                  </button>

                </div>

              )}


              {/* NOMBRE */}

              {formData.imagen && (

                <div className="uploaded-file-name">

                  <CheckCircle
                    size={16}
                  />

                  <span>
                    {
                      formData.imagen
                    }
                  </span>

                </div>

              )}

            </div>


            <small className="image-help">

              La imagen se subirá automáticamente
              a backend/uploads/

            </small>

          </div>


          {/* =================================================
              FECHA MOSTRAR
          ================================================= */}

          <div className="form-group">

            <label>
              Fecha para mostrar
            </label>


            <input

              type="text"

              className="form-input"

              value={
                formData.fecha
              }

              onChange={(event) =>
                setFormData({
                  ...formData,
                  fecha:
                    event.target.value,
                })
              }

              placeholder="03 octubre 2026"

            />

          </div>


          {/* =================================================
              FUENTE
          ================================================= */}

          <div className="form-group">

            <label>
              Fuente
            </label>


            <input

              type="text"

              className="form-input"

              value={
                formData.fuente
              }

              onChange={(event) =>
                setFormData({
                  ...formData,
                  fuente:
                    event.target.value,
                })
              }

              placeholder="Andina.pe"

            />

          </div>


          {/* =================================================
              DESCRIPCIÓN
          ================================================= */}

          <div className="form-group">

            <label>
              Descripción
            </label>


            <textarea

              className="form-textarea"

              rows={3}

              value={
                formData.descripcion
              }

              onChange={(event) =>
                setFormData({
                  ...formData,
                  descripcion:
                    event.target.value,
                })
              }

            />

          </div>


          {/* =================================================
              CHECKBOXES
          ================================================= */}

          <div className="form-checkboxes">

            <label className="checkbox-label">

              <input

                type="checkbox"

                checked={
                  formData.destacada
                }

                onChange={(event) =>
                  setFormData({
                    ...formData,
                    destacada:
                      event.target.checked,
                  })
                }

              />

              <span>
                Noticia destacada
              </span>

            </label>


            <label className="checkbox-label">

              <input

                type="checkbox"

                checked={
                  formData.activa
                }

                onChange={(event) =>
                  setFormData({
                    ...formData,
                    activa:
                      event.target.checked,
                  })
                }

              />

              <span>
                Noticia activa
              </span>

            </label>

          </div>


          {/* =================================================
              BOTONES
          ================================================= */}

          <div className="form-actions">

            <button

              type="button"

              className="secondary-btn"

              onClick={
                cerrarModal
              }

            >
              Cancelar
            </button>


            <button

              type="submit"

              className="save-btn"

              disabled={
                subiendoImagen
              }

            >

              {subiendoImagen ? (
                <>
                  <Loader2
                    size={16}
                    className="spin"
                  />

                  Esperando imagen...
                </>
              ) : editingNoticia ? (
                "Actualizar"
              ) : (
                "Crear"
              )}

            </button>

          </div>

        </form>

      </SidePanel>


      {/* =================================================
          PANEL VER
      ================================================= */}

      <SidePanel

        isOpen={
          !!viewingNoticia
        }

        onClose={() =>
          setViewingNoticia(
            null
          )
        }

        title={
          viewingNoticia?.titulo ||
          "Vista previa"
        }

        wide
      >

        {viewingNoticia && (

          <div className="preview-noticia">

            {/* IMAGEN */}

            {obtenerImagenLocal(
              viewingNoticia
            ) && (

              <img

                src={
                  obtenerImagenLocal(
                    viewingNoticia
                  )
                }

                alt={
                  viewingNoticia.titulo
                }

                className="preview-noticia-img"

                onError={(event) => {

                  event.currentTarget.style.display =
                    "none";

                }}

              />

            )}


            {/* META */}

            <div className="preview-noticia-meta">

              <span className="preview-tag">

                <Tag
                  size={13}
                />

                {
                  viewingNoticia.categoria
                }

              </span>


              {viewingNoticia.fecha && (

                <span className="preview-tag">

                  <Calendar
                    size={13}
                  />

                  {
                    viewingNoticia.fecha
                  }

                </span>

              )}


              {viewingNoticia.autor && (

                <span className="preview-tag">

                  {
                    viewingNoticia.autor
                  }

                </span>

              )}


              {viewingNoticia.fuente && (

                <span className="preview-tag">

                  {
                    viewingNoticia.fuente
                  }

                </span>

              )}


              {viewingNoticia.destacada && (

                <span className="preview-tag active">

                  <Star
                    size={13}
                  />

                  Destacada

                </span>

              )}


              {viewingNoticia.activa && (

                <span className="preview-tag active">

                  <CheckCircle
                    size={13}
                  />

                  Activa

                </span>

              )}

            </div>


            {/* RESUMEN */}

            {viewingNoticia.resumen && (

              <p className="preview-noticia-resumen">

                {
                  viewingNoticia.resumen
                }

              </p>

            )}


            {/* CONTENIDO */}

            <p className="preview-noticia-contenido">

              {
                viewingNoticia.contenido ||
                viewingNoticia.descripcion
              }

            </p>


            {/* BOTONES */}

            <div className="form-actions">

              <button

                type="button"

                className="secondary-btn"

                onClick={() =>
                  setViewingNoticia(
                    null
                  )
                }

              >
                Cerrar
              </button>


              <button

                type="button"

                className="save-btn"

                onClick={() => {

                  const noticia =
                    viewingNoticia;

                  setViewingNoticia(
                    null
                  );

                  handleEdit(
                    noticia
                  );

                }}

              >

                <Edit
                  size={17}
                />

                Editar

              </button>

            </div>

          </div>

        )}

      </SidePanel>

    </motion.div>
  );
};


export default NoticiasManager; 
