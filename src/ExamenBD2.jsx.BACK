import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    cargarPreguntas();
  }, []);

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
  }, [pantalla, tiempoInicio]);

  const cargarPreguntas = async () => {
    try {
      const { data } = await supabase
        .from('banco_preguntas')
        .select('*')
        .eq('activa', true);
      if (data) {
        const aleatorio = data.sort(() => Math.random() - 0.5).slice(0, 20);
        setPreguntas(aleatorio);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const iniciar = () => {
    if (nombre.trim() && email.trim()) {
      setTiempoInicio(new Date());
      setPantalla('examen');
    } else {
      alert('Completa nombre y email');
    }
  };

  const responder = (valor) => {
    setRespuestas({ ...respuestas, [indexPregunta]: valor });
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

  const terminar = async () => {
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
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('EVALUACIÓN - BASES DE DATOS II', 105, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Estudiante: ${nombre}`, 20, 35);
    doc.text(`Email: ${email}`, 20, 45);
    doc.text(`Carrera: ${carrera}`, 20, 55);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 65);
    const porcentaje = ((puntos / preguntas.length) * 100).toFixed(1);
    const estado = puntos >= 14 ? 'APROBADO' : 'REPROBADO';
    doc.text(`Calificación: ${puntos}/${preguntas.length} (${porcentaje}%) - ${estado}`, 20, 80);
    doc.save(`Examen_${nombre}.pdf`);
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
            disabled={!nombre.trim() || !email.trim()}
            style={{ width: '100%', padding: '12px', backgroundColor: nombre.trim() && email.trim() ? '#0066cc' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 'bold', cursor: nombre.trim() && email.trim() ? 'pointer' : 'not-allowed' }}
          >
            Comenzar Examen
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

            {p.tipo === 'drag_drop' && p.drag_drop_items && (
              <div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Haz clic para emparejar:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', marginBottom: '8px' }}>CONCEPTO</p>
                    {p.drag_drop_items.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => responder(item.item_izquierdo)}
                        style={{
                          padding: '8px',
                          marginBottom: '8px',
                          border: respuestas[indexPregunta] === item.item_izquierdo ? '2px solid #0066cc' : '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: respuestas[indexPregunta] === item.item_izquierdo ? '#f0f7ff' : '#fafafa',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#333'
                        }}
                      >
                        {item.item_izquierdo}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', marginBottom: '8px' }}>DEFINICIÓN</p>
                    {p.drag_drop_items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px',
                          marginBottom: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: '#f5f5f5',
                          fontSize: '12px',
                          color: '#333'
                        }}
                      >
                        {item.item_derecho}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
    const porcentaje = ((puntos / preguntas.length) * 100).toFixed(1);
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
            <div style={{ fontSize: '50px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>{puntos}/{preguntas.length}</div>
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
