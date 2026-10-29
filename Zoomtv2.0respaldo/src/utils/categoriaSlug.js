// Convierte entre la clave de categoría usada en noticiasData ("Música")
// y el slug usado en las URLs ("musica"), ya que los acentos en la URL
// se ven mal codificados.
const SLUG_A_CATEGORIA = {
  actualidad: "Actualidad",
  deportes: "Deportes",
  nacionales: "Nacionales",
  regionales: "Regionales",
  musica: "Música",
};

export const categoriaASlug = (categoria) =>
  categoria === "Música" ? "musica" : categoria.toLowerCase();

export const slugACategoria = (slug) => SLUG_A_CATEGORIA[slug] || slug;
