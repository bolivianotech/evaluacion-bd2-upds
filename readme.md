# 📚 EVALUACIÓN INTERACTIVA - BASES DE DATOS II

Sistema de evaluación en línea para el curso **Bases de Datos II** (UPDS) con preguntas de opción múltiple, verdadero/falso y drag & drop.

**Instructor:** Ing. M.Sc. Jimmy Nataniel Requena Llorentty  
**Institución:** Universidad Privada Domingo Savio (UPDS)  
**Versión:** 1.0.0  
**Estado:** ✅ Producción

---

## 🎯 Características

✅ **8 Preguntas Interactivas**
- 6 preguntas de opción múltiple
- 6 preguntas verdadero/falso  
- 3 preguntas drag & drop (emparejar conceptos)

✅ **Temas Cubiertos**
- Vistas (lógicas y materializadas)
- Índices y rendimiento
- Funciones PL/pgSQL
- Triggers y auditoría automática
- Seguridad (roles, permisos, RLS)
- Transacciones ACID
- Backup y Alta Disponibilidad
- RPO y RTO

✅ **Base de Datos Supabase**
- Almacenamiento seguro de resultados
- Respuestas persistentes
- Reportes y estadísticas
- Auditoría completa

✅ **Descarga PDF**
- Reportes personalizados
- Detalles completos de respuestas
- Calificación por tema
- Certificado de evaluación

✅ **Interfaz Moderna**
- Diseño responsive
- Animaciones fluidas
- Gradientes y efectos visuales
- Indicadores de progreso en tiempo real

---

## 📋 Requisitos Previos

### Instalación Local
- Node.js ≥ 14.0.0
- npm ≥ 6.0.0
- Cuenta de Supabase (gratuita en https://supabase.com)
- Git

---

## 🚀 Quick Start

### 1. Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/evaluacion-bd2-upds.git
cd evaluacion-bd2-upds
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Supabase

#### Paso 3a: Crear Proyecto
1. Ir a https://supabase.com
2. Click en "New Project"
3. Llenar formulario:
   - Name: `evaluacion-bd2-upds`
   - Database password: (guardar en lugar seguro)
   - Region: Seleccionar la más cercana
4. Esperar ~3 minutos

#### Paso 3b: Obtener Credenciales
1. Settings → API
2. Copiar:
   - Project URL
   - anon public key

#### Paso 3c: Crear Archivo .env.local
```bash
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Crear Tablas en Supabase

#### Opción A: SQL Editor (Recomendado)
1. En Supabase Dashboard → SQL Editor
2. New Query
3. Copiar contenido de `01_supabase_setup.sql`
4. Run ✓
5. New Query
6. Copiar contenido de `02_banco_preguntas.sql`
7. Run ✓

#### Opción B: CLI (Alternativa)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Conectar a proyecto
supabase link --project-ref xxxxx

# Ejecutar migraciones
psql -h xxxxx.supabase.co -U postgres -d postgres -f 01_supabase_setup.sql
psql -h xxxxx.supabase.co -U postgres -d postgres -f 02_banco_preguntas.sql
```

### 5. Iniciar Desarrollo
```bash
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador

---

## 📁 Estructura del Proyecto

```
evaluacion-bd2-upds/
├── public/
│   └── index.html
├── src/
│   ├── EvaluacionBasesII.jsx      # Componente principal
│   ├── supabaseClient.js           # Cliente de Supabase
│   ├── App.js
│   └── index.js
├── sql/
│   ├── 01_supabase_setup.sql       # Creación de tablas
│   └── 02_banco_preguntas.sql      # Banco de preguntas
├── .env.local                       # Variables de ambiente
├── package.json
└── README.md
```

---

## 📊 Base de Datos - Esquema

### Tablas Principales

#### `estudiantes`
```sql
id | nombre | email | carrera | fecha_registro | estado
```

#### `evaluaciones`
```sql
id | estudiante_id | calificacion_total | cantidad_preguntas 
   | preguntas_correctas | porcentaje | fecha_inicio 
   | fecha_finalizacion | duracion_minutos | estado | intento_numero
```

#### `respuestas_pregunta`
```sql
id | evaluacion_id | numero_pregunta | tipo_pregunta 
   | respuesta_usuario | respuesta_correcta | es_correcta 
   | puntos_obtenidos | puntos_totales | tiempo_segundos
```

#### `banco_preguntas`
```sql
id | numero_pregunta | tipo | enunciado | tema | dificultad | puntos | activa
```

#### `opciones_pregunta`
```sql
id | pregunta_id | numero_opcion | texto_opcion | es_correcta | retroalimentacion
```

#### `verdadero_falso`
```sql
id | pregunta_id | enunciado | respuesta_correcta | explicacion
```

#### `drag_drop`
```sql
id | pregunta_id | enunciado
```

#### `drag_drop_items`
```sql
id | drag_drop_id | item_izquierdo | item_derecho | posicion
```

#### `auditoria_evaluaciones`
```sql
id | evaluacion_id | estudiante_id | accion | detalles 
   | ip_address | user_agent | fecha_hora
```

---

## 🔧 Funciones Disponibles

### Estudiantes
```javascript
import { servicioEstudiantes } from './supabaseClient';

// Crear o actualizar
const { data, isNew } = await servicioEstudiantes.crearEstudiante(
  'Juan Pérez', 
  'juan@upds.edu.bo', 
  'Ingeniería Informática'
);

// Obtener
const estudiante = await servicioEstudiantes.obtenerEstudiante('juan@upds.edu.bo');

// Evaluaciones del estudiante
const evaluaciones = await servicioEstudiantes.obtenerEvaluacionesEstudiante(id);

// Resumen de desempeño
const resumen = await servicioEstudiantes.obtenerResumenEstudiante(id);
```

### Preguntas
```javascript
import { servicioPreguntas } from './supabaseClient';

// Cargar todas
const preguntas = await servicioPreguntas.cargarTodasLasPreguntas();

// Por tema
const preguntasVistas = await servicioPreguntas.cargarPreguntasPorTema('Vistas');

// Temas disponibles
const temas = await servicioPreguntas.obtenerTemas();
```

### Evaluaciones
```javascript
import { servicioEvaluaciones } from './supabaseClient';

// Crear evaluación
const evaluacion = await servicioEvaluaciones.crearEvaluacion(estudianteId);

// Guardar respuesta
await servicioEvaluaciones.guardarRespuesta(
  evaluacionId,
  preguntaId,
  numeroPregunta,
  respuestaUsuario,
  esCorrecta,
  puntosObtenidos,
  puntosMaximos,
  tipoPregunta
);

// Finalizar
const resultado = await servicioEvaluaciones.finalizarEvaluacion(evaluacionId);

// Obtener detalle
const detalle = await servicioEvaluaciones.obtenerDetalleEvaluacion(evaluacionId);
```

### Reportes
```javascript
import { servicioReportes } from './supabaseClient';

// Ranking de estudiantes
const ranking = await servicioReportes.obtenerRanking();

// Desempeño por tema
const desempeno = await servicioReportes.obtenerDesempenioPorTema();

// Resumen de evaluaciones
const resumen = await servicioReportes.obtenerResumenEvaluaciones();
```

---

## 📥 Consultas SQL Útiles

### Promedio de notas por estudiante
```sql
SELECT 
  e.nombre,
  e.email,
  ROUND(AVG(ev.porcentaje)::numeric, 2) as promedio,
  COUNT(ev.id) as intentos
FROM estudiantes e
LEFT JOIN evaluaciones ev ON e.id = ev.estudiante_id 
  AND ev.estado = 'completada'
GROUP BY e.id, e.nombre, e.email
ORDER BY promedio DESC;
```

### Desempeño por tema
```sql
SELECT 
  bp.tema,
  COUNT(rp.id) as total_respuestas,
  COUNT(CASE WHEN rp.es_correcta THEN 1 END) as correctas,
  ROUND((COUNT(CASE WHEN rp.es_correcta THEN 1 END)::numeric / 
         COUNT(rp.id)::numeric * 100), 2) as porcentaje_acierto
FROM respuestas_pregunta rp
JOIN evaluaciones ev ON rp.evaluacion_id = ev.id
JOIN banco_preguntas bp ON rp.numero_pregunta = bp.numero_pregunta
WHERE ev.estado = 'completada'
GROUP BY bp.tema
ORDER BY porcentaje_acierto DESC;
```

### Historial de auditoría
```sql
SELECT 
  ae.accion,
  COUNT(*) as total,
  MAX(ae.fecha_hora) as ultima_accion,
  ae.estudiante_id
FROM auditoria_evaluaciones ae
GROUP BY ae.accion, ae.estudiante_id
ORDER BY ae.fecha_hora DESC;
```

---

## 🌐 Desplegar a Producción

### Vercel (Recomendado)
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Con variables de ambiente
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
vercel
```

### Netlify
```bash
# Instalar CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=build

# O conectar repositorio en https://netlify.com
```

### Docker (Avanzado)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t evaluacion-bd2 .
docker run -p 3000:3000 \
  -e REACT_APP_SUPABASE_URL=... \
  -e REACT_APP_SUPABASE_ANON_KEY=... \
  evaluacion-bd2
```

---

## 🔐 Seguridad

### Checklist
- ✅ .env.local en .gitignore
- ✅ RLS policies habilitadas
- ✅ Usar anon key (no service_role_key)
- ✅ HTTPS en producción
- ✅ Validar respuestas en servidor
- ✅ Rate limiting considerado
- ✅ Auditoría de todas las acciones

### RLS Policies
```sql
-- Estudiantes pueden ver sus propias evaluaciones
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own evaluations"
  ON evaluaciones FOR SELECT
  USING (auth.uid()::text = estudiante_id::text);
```

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| CORS error | Agregar dominio a Supabase → Settings → API → Allowed origins |
| 401 Unauthorized | Verificar REACT_APP_SUPABASE_ANON_KEY en .env.local |
| Preguntas no cargan | Ejecutar SQL scripts en Supabase SQL Editor |
| Respuestas no guardan | Verificar RLS policies y permisos INSERT |
| PDF no genera | Instalar: `npm install jspdf jspdf-autotable` |

---

## 📚 Documentación Referencias

- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [jsPDF](https://github.com/parallax/jsPDF)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

---

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a rama (`git push origin feature/AmazingFeature`)
5. Abre Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 📞 Contacto y Soporte

**Instructor:**  
Ing. M.Sc. Jimmy Nataniel Requena Llorentty  
Correo: [correo@upds.edu.bo](mailto:correo@upds.edu.bo)

**Universidad:**  
Universidad Privada Domingo Savio (UPDS)  
Sitio: https://www.upds.edu.bo

---

## 🙏 Agradecimientos

- UPDS por la oportunidad de desarrollar esta herramienta educativa
- Estudiantes por sus sugerencias y feedback
- Equipo de Supabase por la excelente plataforma

---

**Última actualización:** Marzo 2024  
**Versión:** 1.0.0  
**Estado:** ✅ Producción
