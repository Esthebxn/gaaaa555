import React, { useState, useEffect } from "react";
import "./Programacion12.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const normalizarDia = (dia = "") => dia
  .toLocaleLowerCase("es")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

const diasVacios = {
  lunes: [],
  martes: [],
  miercoles: [],
  jueves: [],
  viernes: [],
  sabado: [],
  domingo: [],
};

export default function Programacion12() {
  const [selectedDay, setSelectedDay] = useState("lunes");
  const [programacionData, setProgramacionData] = useState(diasVacios);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/programacion`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const organizado = { ...diasVacios, lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [], domingo: [] };
        (Array.isArray(data) ? data : [])
          .filter((programa) => programa.activo === true || Number(programa.activo) === 1)
          .forEach((programa) => {
            const clave = normalizarDia(programa.dia_semana);
            if (organizado[clave]) {
              organizado[clave].push({
                id: programa.id,
                hora: programa.hora || String(programa.horario_inicio || "").slice(0, 5),
                programa: programa.nombre_programa,
                descripcion: programa.descripcion,
                categoria: programa.categoria,
              });
            }
          });
        setProgramacionData(organizado);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("No se pudo cargar programación desde la API:", err);
        setLoading(false);
      });
  }, []);

  const days = [
    { id: "lunes", name: "Lunes" },
    { id: "martes", name: "Martes" },
    { id: "miercoles", name: "Miércoles" },
    { id: "jueves", name: "Jueves" },
    { id: "viernes", name: "Viernes" },
    { id: "sabado", name: "Sábado" },
    { id: "domingo", name: "Domingo" },
  ];

  return (
    <div className="programacion-container">
      <header className="programacion-header">
        <h1>PROGRAMACIÓN ZOOM TV CANAL 10 MEGACABLE</h1>
      </header>

      <div className="filter-buttons">
        {days.map((day) => (
          <button
            key={day.id}
            className={`filter-button ${selectedDay === day.id ? "active" : ""}`}
            onClick={() => setSelectedDay(day.id)}
          >
            {day.name}
          </button>
        ))}
      </div>

      <div className="schedule-day">
        <div className="schedule">
          <div className="day-header">
            {days.find((day) => day.id === selectedDay)?.name}
          </div>

          {loading ? (
            <div className="no-programs">Cargando programación...</div>
          ) : programacionData[selectedDay] && programacionData[selectedDay].length > 0 ? (
            <table className="programs-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Programa</th>
                </tr>
              </thead>
              <tbody>
                {programacionData[selectedDay].map((programa) => (
                  <tr key={programa.id} className="program-item">
                    <td className="program-time">{programa.hora}</td>
                    <td className="program-info">
                      <h3>{programa.programa}</h3>
                      <p>{programa.descripcion}</p>
                      <span className="program-category">{programa.categoria}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-programs">
              No hay programación disponible para este día
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
