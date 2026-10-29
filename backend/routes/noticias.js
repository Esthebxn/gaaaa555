const express = require("express");

const router = express.Router();

/*
  server.js crea global.db antes de cargar esta ruta.
*/
const db = global.db;

/* =========================================================
   GET - TODAS LAS NOTICIAS
========================================================= */

router.get("/", (req, res) => {
  const { categoria, activa, destacada } = req.query;

  let conditions = [];
  let values = [];

  if (activa !== undefined) {
    conditions.push("activa = ?");
    values.push(activa === 'true' || activa === '1' ? 1 : 0);
  }

  if (destacada !== undefined) {
    conditions.push("destacada = ?");
    values.push(destacada === 'true' || destacada === '1' ? 1 : 0);
  }

  if (categoria && String(categoria).trim() !== "" && String(categoria).trim().toLowerCase() !== "actualidad") {
    const cat = String(categoria).trim().toLowerCase();
    const mapEquivalencias = {
      'deportes': ['Deportes', 'Deporte', 'deportes', 'deporte'],
      'música': ['Música', 'Musica', 'música', 'musica'],
      'musica': ['Música', 'Musica', 'música', 'musica'],
      'nacionales': ['Nacionales', 'Nacional', 'nacionales', 'nacional'],
      'regionales': ['Regionales', 'Regional', 'regionales', 'regional']
    };
    const lista = mapEquivalencias[cat] || [categoria];
    conditions.push(`categoria IN (${lista.map(() => '?').join(',')})`);
    values.push(...lista);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT
      id,
      titulo,
      contenido,
      resumen,
      categoria,
      autor,
      imagen_url,
      fecha_publicacion,
      destacada,
      activa,
      descripcion,
      imagen,
      fecha,
      fuente,
      created_at,
      updated_at
    FROM noticias
    ${whereClause}
    ORDER BY id DESC
  `;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error(
        "GET /api/noticias ERROR:",
        err
      );

      return res.status(500).json({
        error: "Error al consultar noticias",
        message: err.message,
        code: err.code,
      });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const formatted = results.map(row => {
      let imgUrl = row.imagen_url;
      if (!imgUrl && row.imagen) {
        imgUrl = `${baseUrl}/uploads/${encodeURIComponent(row.imagen)}`;
      }
      return {
        ...row,
        imagen_url: imgUrl || row.imagen_url
      };
    });

    res.json(formatted);
  });
});


/* =========================================================
   GET - UNA NOTICIA
========================================================= */

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      error: "ID inválido",
    });
  }

  const sql = `
    SELECT
      id,
      titulo,
      contenido,
      resumen,
      categoria,
      autor,
      imagen_url,
      fecha_publicacion,
      destacada,
      activa,
      descripcion,
      imagen,
      fecha,
      fuente,
      created_at,
      updated_at
    FROM noticias
    WHERE id = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [id],
    (err, results) => {
      if (err) {
        console.error(
          "GET /api/noticias/:id ERROR:",
          err
        );

        return res.status(500).json({
          error: "Error al consultar la noticia",
          message: err.message,
          code: err.code,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: "Noticia no encontrada",
        });
      }

      const row = results[0];
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'http';
      const baseUrl = `${protocol}://${host}`;
      let imgUrl = row.imagen_url;
      if (!imgUrl && row.imagen) {
        imgUrl = `${baseUrl}/uploads/${encodeURIComponent(row.imagen)}`;
      }

      res.json({
        ...row,
        imagen_url: imgUrl || row.imagen_url
      });
    }
  );
});


/* =========================================================
   POST - CREAR NOTICIA
========================================================= */

router.post("/", (req, res) => {
  const {
    titulo,
    contenido,
    resumen,
    categoria,
    autor,
    imagen_url,
    fecha_publicacion,
    destacada,
    activa,
    descripcion,
    imagen,
    fecha,
    fuente,
  } = req.body;

  if (!titulo || !String(titulo).trim()) {
    return res.status(400).json({
      error: "El título es obligatorio",
    });
  }

  if (
    !contenido ||
    !String(contenido).trim()
  ) {
    return res.status(400).json({
      error: "El contenido es obligatorio",
    });
  }

  if (
    !categoria ||
    !String(categoria).trim()
  ) {
    return res.status(400).json({
      error: "La categoría es obligatoria",
    });
  }

  const sql = `
    INSERT INTO noticias (
      titulo,
      contenido,
      resumen,
      categoria,
      autor,
      imagen_url,
      fecha_publicacion,
      destacada,
      activa,
      descripcion,
      imagen,
      fecha,
      fuente
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    String(titulo).trim(),
    String(contenido).trim(),
    resumen ? String(resumen).trim() : null,
    String(categoria).trim(),
    autor
      ? String(autor).trim()
      : "Admin",
    imagen_url
      ? String(imagen_url).trim()
      : null,
    fecha_publicacion || null,
    destacada ? 1 : 0,
    activa === false ||
    activa === 0
      ? 0
      : 1,
    descripcion
      ? String(descripcion).trim()
      : null,
    imagen
      ? String(imagen).trim()
      : null,
    fecha
      ? String(fecha).trim()
      : null,
    fuente
      ? String(fuente).trim()
      : null,
  ];

  db.query(
    sql,
    valores,
    (err, result) => {
      if (err) {
        console.error(
          "POST /api/noticias ERROR:",
          err
        );

        return res.status(500).json({
          error: "Error al crear noticia",
          message: err.message,
          code: err.code,
          sqlMessage: err.sqlMessage,
        });
      }

      /*
        Devolvemos la noticia recién creada.
      */

      const id = result.insertId;

      db.query(
        "SELECT * FROM noticias WHERE id = ?",
        [id],
        (selectErr, rows) => {
          if (selectErr) {
            console.error(
              "Error recuperando noticia creada:",
              selectErr
            );

            return res.status(201).json({
              id,
              ...req.body,
            });
          }

          res.status(201).json(
            rows[0]
          );
        }
      );
    }
  );
});


/* =========================================================
   PUT - ACTUALIZAR NOTICIA
========================================================= */

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      error: "ID inválido",
    });
  }

  const {
    titulo,
    contenido,
    resumen,
    categoria,
    autor,
    imagen_url,
    fecha_publicacion,
    destacada,
    activa,
    descripcion,
    imagen,
    fecha,
    fuente,
  } = req.body;

  if (!titulo || !String(titulo).trim()) {
    return res.status(400).json({
      error: "El título es obligatorio",
    });
  }

  if (
    !contenido ||
    !String(contenido).trim()
  ) {
    return res.status(400).json({
      error: "El contenido es obligatorio",
    });
  }

  if (
    !categoria ||
    !String(categoria).trim()
  ) {
    return res.status(400).json({
      error: "La categoría es obligatoria",
    });
  }

  const sql = `
    UPDATE noticias
    SET
      titulo = ?,
      contenido = ?,
      resumen = ?,
      categoria = ?,
      autor = ?,
      imagen_url = ?,
      fecha_publicacion = ?,
      destacada = ?,
      activa = ?,
      descripcion = ?,
      imagen = ?,
      fecha = ?,
      fuente = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const valores = [
    String(titulo).trim(),
    String(contenido).trim(),

    resumen
      ? String(resumen).trim()
      : null,

    String(categoria).trim(),

    autor
      ? String(autor).trim()
      : "Admin",

    imagen_url
      ? String(imagen_url).trim()
      : null,

    /*
      MySQL DATETIME acepta YYYY-MM-DD.
      Si viene vacío dejamos NULL.
    */
    fecha_publicacion
      ? String(
          fecha_publicacion
        ).trim()
      : null,

    destacada ? 1 : 0,

    activa === false ||
    activa === 0
      ? 0
      : 1,

    descripcion
      ? String(
          descripcion
        ).trim()
      : null,

    imagen
      ? String(imagen).trim()
      : null,

    fecha
      ? String(fecha).trim()
      : null,

    fuente
      ? String(fuente).trim()
      : null,

    id,
  ];

  console.log(
    "Actualizando noticia:",
    id
  );

  db.query(
    sql,
    valores,
    (err, result) => {
      if (err) {
        console.error(
          "PUT /api/noticias/:id ERROR:",
          err
        );

        return res.status(500).json({
          error: "Error al actualizar noticia",
          message: err.message,
          code: err.code,
          sqlMessage: err.sqlMessage,
        });
      }

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          error: "Noticia no encontrada",
          id,
        });
      }

      /*
        Devolver registro actualizado.
      */

      db.query(
        "SELECT * FROM noticias WHERE id = ?",
        [id],
        (selectErr, rows) => {
          if (selectErr) {
            console.error(
              "Error recuperando noticia actualizada:",
              selectErr
            );

            return res.json({
              message:
                "Noticia actualizada correctamente",
              id,
            });
          }

          return res.json(
            rows[0]
          );
        }
      );
    }
  );
});


/* =========================================================
   DELETE - ELIMINAR NOTICIA
========================================================= */

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      error: "ID inválido",
    });
  }

  const sql =
    "DELETE FROM noticias WHERE id = ?";

  db.query(
    sql,
    [id],
    (err, result) => {
      if (err) {
        console.error(
          "DELETE /api/noticias/:id ERROR:",
          err
        );

        return res.status(500).json({
          error: "Error al eliminar noticia",
          message: err.message,
          code: err.code,
        });
      }

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          error: "Noticia no encontrada",
        });
      }

      res.json({
        message:
          "Noticia eliminada correctamente",
        id,
      });
    }
  );
});


module.exports = router; 