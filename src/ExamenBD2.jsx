import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function ExamenBD2() {
  const [pantalla, setPantalla] = useState('inicio');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [carrera, setCarrera] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [indexPregunta, setIndexPregunta] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [puntos, setPuntos] = useState(0);
  const [tiempo, setTiempo] = useState(3600);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [dragSelected, setDragSelected] = useState(null);

  const cargarPreguntas = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');
    try {
      const { data, error } = await supabase
        .from('banco_preguntas')
        .select('*')
        .eq('activa', true);

      if (error) {
        setErrorCarga('Error al conectar con la base de datos: ' + error.message);
        setCargando(false);
        return;
      }

      if (!data || data.length === 0) {
        setErrorCarga('No se encontraron preguntas activas en la base de datos.');
        setCargando(false);
        return;
      }

      const aleatorio = data.sort(() => Math.random() - 0.5).slice(0, 20);
      setPreguntas(aleatorio);
      setCargando(false);
    } catch (err) {
      setErrorCarga('Error de conexión: ' + err.message);
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPreguntas();
  }, [cargarPreguntas]);

  const terminar = useCallback(async () => {
    let calificacion = 0;
    preguntas.forEach((p, i) => {
      if (respuestas[i] !== undefined) calificacion += 1;
    });
    setPuntos(calificacion);
    setPantalla('resultado');

    try {
      await supabase.from('evaluaciones').insert({
        nombre_estudiante: nombre,
        email_estudiante: email,
        carrera: carrera || 'Sin especificar',
        puntuacion: calificacion,
        total_preguntas: preguntas.length,
        aprobado: calificacion >= 14,
        fecha_evaluacion: new Date().toISOString()
      });
    } catch (error) {
      console.log('Error al guardar:', error);
    }
  }, [preguntas, respuestas, nombre, email, carrera]);

  useEffect(() => {
    if (pantalla === 'examen' && tiempoInicio) {
      const timer = setInterval(() => {
        const diff = 3600000 - (new Date() - tiempoInicio);
        if (diff <= 0) {
          terminar();
          clearInterval(timer);
        } else {
          setTiempo(Math.floor(diff / 1000));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pantalla, tiempoInicio, terminar]);

  const iniciar = () => {
    if (!nombre.trim() || !email.trim()) {
      alert('Completa nombre y email');
      return;
    }
    if (cargando) {
      alert('Las preguntas aún se están cargando, espera un momento...');
      return;
    }
    if (errorCarga || preguntas.length === 0) {
      alert('No se pudieron cargar las preguntas. Verifica tu conexión e intenta recargar la página.');
      return;
    }
    setTiempoInicio(new Date());
    setPantalla('examen');
  };

  // Reset drag selection when navigating between questions
  useEffect(() => {
    setDragSelected(null);
  }, [indexPregunta]);

  const responder = (valor) => {
    if (valor === undefined) {
      const copia = { ...respuestas };
      delete copia[indexPregunta];
      setRespuestas(copia);
    } else {
      setRespuestas({ ...respuestas, [indexPregunta]: valor });
    }
  };

  const siguiente = () => {
    if (indexPregunta < preguntas.length - 1) {
      setIndexPregunta(indexPregunta + 1);
    } else {
      terminar();
    }
  };

  const anterior = () => {
    if (indexPregunta > 0) {
      setIndexPregunta(indexPregunta - 1);
    }
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    const total = preguntas.length || 20;
    const porcentaje = ((puntos / total) * 100).toFixed(1);
    const estado = puntos >= 14 ? 'APROBADO' : 'REPROBADO';
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxW = pageW - margin * 2;

    // Encabezado
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('EVALUACIÓN - BASES DE DATOS II', pageW / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Universidad Privada Domingo Savio (UPDS)', pageW / 2, 22, { align: 'center' });

    // Datos del estudiante
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    let y = 38;
    doc.setFont(undefined, 'bold');
    doc.text('Estudiante:', margin, y);
    doc.setFont(undefined, 'normal');
    doc.text(nombre, margin + 28, y);

    doc.setFont(undefined, 'bold');
    doc.text('Email:', margin + 95, y);
    doc.setFont(undefined, 'normal');
    doc.text(email, margin + 110, y);

    y += 8;
    doc.setFont(undefined, 'bold');
    doc.text('Carrera:', margin, y);
    doc.setFont(undefined, 'normal');
    doc.text(carrera || 'Sin especificar', margin + 22, y);

    doc.setFont(undefined, 'bold');
    doc.text('Fecha:', margin + 95, y);
    doc.setFont(undefined, 'normal');
    doc.text(new Date().toLocaleDateString('es-ES'), margin + 110, y);

    // Resultado
    y += 10;
    const colorRes = puntos >= 14 ? [34, 197, 94] : [220, 53, 69];
    doc.setFillColor(...colorRes);
    doc.rect(margin, y, maxW, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text(`Calificación: ${puntos}/${total} (${porcentaje}%) - ${estado}`, pageW / 2, y + 8, { align: 'center' });

    // Detalle de preguntas
    y += 20;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('DETALLE DE RESPUESTAS', margin, y);
    y += 2;
    doc.setDrawColor(0, 102, 204);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    preguntas.forEach((p, i) => {
      // Nueva página si no hay espacio
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 102, 204);
      doc.text(`Pregunta ${i + 1} (${p.tipo === 'multiple' ? 'Opción múltiple' : p.tipo === 'verdadero_falso' ? 'Verdadero/Falso' : 'Emparejar'})`, margin, y);
      y += 5;

      // Enunciado
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      const enuncLines = doc.splitTextToSize(p.enunciado, maxW);
      doc.text(enuncLines, margin, y);
      y += enuncLines.length * 4.5;

      // Respuesta del estudiante
      const resp = respuestas[i];
      let textoResp = 'Sin responder';

      if (resp !== undefined) {
        if (p.tipo === 'multiple' && p.opciones && p.opciones[resp]) {
          textoResp = `Respuesta: ${p.opciones[resp].texto_opcion}`;
        } else if (p.tipo === 'verdadero_falso') {
          textoResp = `Respuesta: ${resp === true ? 'Verdadero' : 'Falso'}`;
        } else if (p.tipo === 'drag_drop') {
          if (typeof resp === 'object') {
            textoResp = Object.entries(resp).map(([k, v]) => `${k} → ${v}`).join('\n');
          } else {
            textoResp = `Seleccionado: ${resp}`;
          }
        }
      }

      doc.setFont(undefined, 'italic');
      doc.setTextColor(resp !== undefined ? 34 : 180, resp !== undefined ? 120 : 50, resp !== undefined ? 20 : 50);
      const respLines = doc.splitTextToSize(textoResp, maxW - 5);
      doc.text(respLines, margin + 3, y);
      y += respLines.length * 4.5 + 4;

      // Separador
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageW - margin, y);
      y += 5;
    });

    doc.save(`Examen_BD2_${nombre.replace(/\s+/g, '_')}.pdf`);
  };

  const mins = Math.floor(tiempo / 60);
  const secs = tiempo % 60;
  const tiempoFormato = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // PANTALLA INICIO
  if (pantalla === 'inicio') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '550px', backgroundColor: 'white', padding: '50px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ textAlign: 'center', fontSize: '28px', color: '#333', marginBottom: '10px' }}>Bases de Datos II</h1>
          <p style={{ textAlign: 'center', color: '#999', marginBottom: '40px', fontSize: '13px' }}>UPDS 2024 - Evaluación</p>

          <div style={{ backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '5px', marginBottom: '30px', fontSize: '13px', lineHeight: '1.8', color: '#555' }}>
            <p><strong>ℹ️ Información del examen:</strong></p>
            <p>⏱️ Duración: 60 minutos</p>
            <p>📊 Preguntas: 20 (aleatorias)</p>
            <p>✓ Nota mínima: 14 puntos (70%)</p>
            <p>⚠️ Intentos: 1 solamente</p>
          </div>

          {cargando && (
            <div style={{ textAlign: 'center', padding: '10px', marginBottom: '15px', color: '#0066cc', fontSize: '13px' }}>
              ⏳ Cargando preguntas...
            </div>
          )}

          {errorCarga && (
            <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '12px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', color: '#856404' }}>
              ⚠️ {errorCarga}
              <button
                onClick={cargarPreguntas}
                style={{ display: 'block', marginTop: '8px', padding: '6px 12px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
              >
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !errorCarga && preguntas.length > 0 && (
            <div style={{ textAlign: 'center', padding: '8px', marginBottom: '15px', color: '#22c55e', fontSize: '13px' }}>
              ✓ {preguntas.length} preguntas listas
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
            <input
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
            <input
              type="text"
              placeholder="Tu carrera (opcional)"
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={iniciar}
            disabled={!nombre.trim() || !email.trim() || cargando || preguntas.length === 0}
            style={{
              width: '100%', padding: '12px',
              backgroundColor: (nombre.trim() && email.trim() && !cargando && preguntas.length > 0) ? '#0066cc' : '#ccc',
              color: 'white', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 'bold',
              cursor: (nombre.trim() && email.trim() && !cargando && preguntas.length > 0) ? 'pointer' : 'not-allowed'
            }}
          >
            {cargando ? 'Cargando...' : 'Comenzar Examen'}
          </button>
        </div>
      </div>
    );
  }

  // PANTALLA EXAMEN - cargando o sin preguntas
  if (pantalla === 'examen' && preguntas.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '50px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>No se pudieron cargar las preguntas</h2>
          <p style={{ color: '#666', marginBottom: '25px', fontSize: '14px' }}>Verifica tu conexión e intenta nuevamente.</p>
          <button
            onClick={() => { setPantalla('inicio'); cargarPreguntas(); }}
            style={{ padding: '12px 24px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // PANTALLA EXAMEN
  if (pantalla === 'examen' && preguntas.length > 0) {
    const p = preguntas[indexPregunta];
    const prog = ((indexPregunta + 1) / preguntas.length) * 100;

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '30px 20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>Pregunta {indexPregunta + 1} de {preguntas.length}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: tiempo <= 300 ? '#d32f2f' : '#0066cc' }}>⏱️ {tiempoFormato}</span>
            </div>
            <div style={{ width: '100%', height: '5px', backgroundColor: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${prog}%`, backgroundColor: '#0066cc', transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '20px', lineHeight: '1.6', fontWeight: 'bold' }}>{p.enunciado}</h3>

            {p.tipo === 'multiple' && p.opciones && (
              <div>
                {p.opciones.map((op, i) => (
                  <div
                    key={i}
                    onClick={() => responder(i)}
                    style={{
                      padding: '12px',
                      marginBottom: '10px',
                      border: respuestas[indexPregunta] === i ? '2px solid #0066cc' : '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: respuestas[indexPregunta] === i ? '#f0f7ff' : '#fafafa',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#333'
                    }}
                  >
                    <input type="radio" checked={respuestas[indexPregunta] === i} readOnly style={{ marginRight: '10px' }} />
                    {op.texto_opcion}
                  </div>
                ))}
              </div>
            )}

            {p.tipo === 'verdadero_falso' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  onClick={() => responder(true)}
                  style={{
                    padding: '15px',
                    border: respuestas[indexPregunta] === true ? '2px solid #22c55e' : '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: respuestas[indexPregunta] === true ? '#f0fdf4' : '#fafafa',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: respuestas[indexPregunta] === true ? '#22c55e' : '#333'
                  }}
                >
                  ✓ Verdadero
                </div>
                <div
                  onClick={() => responder(false)}
                  style={{
                    padding: '15px',
                    border: respuestas[indexPregunta] === false ? '2px solid #ff4444' : '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: respuestas[indexPregunta] === false ? '#fff5f5' : '#fafafa',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: respuestas[indexPregunta] === false ? '#ff4444' : '#333'
                  }}
                >
                  ✗ Falso
                </div>
              </div>
            )}

            {p.tipo === 'drag_drop' && p.drag_drop_items && (() => {
              const pares = respuestas[indexPregunta] || {};
              return (
                <div>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                    1. Haz clic en un <strong>CONCEPTO</strong> (izquierda) para seleccionarlo.
                  </p>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                    2. Luego haz clic en su <strong>DEFINICIÓN</strong> (derecha) para emparejarlo.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', marginBottom: '8px' }}>CONCEPTO</p>
                      {p.drag_drop_items.map((item, i) => {
                        const emparejado = pares[item.item_izquierdo] !== undefined;
                        const seleccionado = dragSelected === item.item_izquierdo;
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              if (emparejado) {
                                const nuevos = { ...pares };
                                delete nuevos[item.item_izquierdo];
                                responder(Object.keys(nuevos).length > 0 ? nuevos : undefined);
                                setDragSelected(null);
                              } else {
                                setDragSelected(seleccionado ? null : item.item_izquierdo);
                              }
                            }}
                            style={{
                              padding: '8px 10px',
                              marginBottom: '8px',
                              border: seleccionado ? '2px solid #0066cc' : emparejado ? '2px solid #22c55e' : '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: seleccionado ? '#dbeafe' : emparejado ? '#f0fdf4' : '#fafafa',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: seleccionado ? '#0066cc' : emparejado ? '#166534' : '#333',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {emparejado ? '✓' : seleccionado ? '▶' : '○'} {item.item_izquierdo}
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', marginBottom: '8px' }}>DEFINICIÓN</p>
                      {p.drag_drop_items.map((item, i) => {
                        const usadaPor = Object.entries(pares).find(([, v]) => v === item.item_derecho);
                        const usada = !!usadaPor;
                        const disponible = !!dragSelected && !usada;
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              if (!dragSelected || usada) return;
                              const nuevos = { ...pares, [dragSelected]: item.item_derecho };
                              responder(nuevos);
                              setDragSelected(null);
                            }}
                            style={{
                              padding: '8px 10px',
                              marginBottom: '8px',
                              border: usada ? '2px solid #22c55e' : disponible ? '1px dashed #0066cc' : '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: usada ? '#f0fdf4' : disponible ? '#f0f7ff' : '#f5f5f5',
                              cursor: disponible ? 'pointer' : 'default',
                              fontSize: '12px',
                              color: usada ? '#166534' : '#555'
                            }}
                          >
                            {usada ? '✓ ' : ''}{item.item_derecho}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {Object.keys(pares).length > 0 && (
                    <button
                      onClick={() => { responder(undefined); setDragSelected(null); }}
                      style={{ marginTop: '10px', padding: '5px 10px', fontSize: '11px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', color: '#888' }}
                    >
                      ✕ Borrar emparejamientos
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={anterior}
              disabled={indexPregunta === 0}
              style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: indexPregunta === 0 ? '#f5f5f5' : 'white', borderRadius: '4px', cursor: indexPregunta === 0 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#333', opacity: indexPregunta === 0 ? 0.5 : 1 }}
            >
              ← Anterior
            </button>
            <button
              onClick={siguiente}
              style={{ padding: '12px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              {indexPregunta === preguntas.length - 1 ? 'Finalizar' : 'Siguiente'} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA RESULTADO
  if (pantalla === 'resultado') {
    const total = preguntas.length || 20;
    const porcentaje = ((puntos / total) * 100).toFixed(1);
    const aprobado = puntos >= 14;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ backgroundColor: aprobado ? '#22c55e' : '#ff4444', color: 'white', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>{aprobado ? '✓' : '✗'}</div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{aprobado ? '¡Felicidades!' : 'No aprobaste'}</h1>
            <p style={{ margin: '0', fontSize: '14px' }}>{aprobado ? 'Excelente desempeño' : 'Necesitabas 14 puntos'}</p>
          </div>

          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>{puntos}/{total}</div>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: aprobado ? '#e6f5ea' : '#fde4e4', color: aprobado ? '#166534' : '#b91c1c', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', marginBottom: '30px' }}>
              {porcentaje}%
            </div>

            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '4px', marginBottom: '25px', fontSize: '12px', textAlign: 'left', color: '#666', lineHeight: '1.8' }}>
              <p><strong>Estudiante:</strong> {nombre}</p>
              <p><strong>Email:</strong> {email}</p>
              <p style={{ marginBottom: '0' }}><strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES')}</p>
            </div>

            <button
              onClick={descargarPDF}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              📥 Descargar PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
