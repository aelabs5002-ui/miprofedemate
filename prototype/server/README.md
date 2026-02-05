# Backend - Tutoría Matemática IA

Backend seguro para la aplicación de Tutoría Matemática que integra OpenAI para proporcionar feedback pedagógico guiado.

## 🚀 Configuración Rápida

### 1. Instalar dependencias

```bash
cd server
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` y añade tu API key de OpenAI:

```env
OPENAI_API_KEY=sk-tu-api-key-aqui
MODEL_NAME=gpt-4o-mini
PORT=3001
NODE_ENV=production
```

### 3. Ejecutar el servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 📡 API Endpoints

### Health Check
```
GET /health
```

**Respuesta:**
```json
{
  "status": "ok",
  "model": "gpt-4o-mini"
}
```

### Tutor Response
```
POST /api/tutor/respond
```

**Request Body:**
```json
{
  "userId": "user123",
  "sessionId": "session456",
  "exerciseId": "ej1",
  "grade": "1sec",
  "topic": "Ecuaciones lineales",
  "studentAnswer": "8",
  "attemptNumber": 1,
  "mode": "text",
  "exercisePrompt": "¿Cuánto es 2x + 3 = 11? Resuelve para x.",
  "hintAllowed": false
}
```

**Response:**
```json
{
  "assistantText": "🤔 Veo que pusiste 8. Pensemos juntos: si x = 8, ¿cuánto sería 2×8 + 3? ¿Eso nos da 11?",
  "nextAction": "retry",
  "meta": {
    "tokensIn": 245,
    "tokensOut": 42,
    "responseTime": 1250,
    "model": "gpt-4o-mini"
  }
}
```

**Valores de `nextAction`:**
- `"retry"`: El estudiante debe intentar de nuevo
- `"hint"`: Se proporcionó una pista, puede intentar de nuevo
- `"next"`: Respuesta correcta, puede avanzar al siguiente ejercicio

## 🌐 Despliegue en Render

### Paso 1: Preparar el repositorio
Asegúrate de que tu código está en un repositorio Git (GitHub, GitLab, etc.)

### Paso 2: Crear Web Service en Render
1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio
4. Configura:
   - **Name**: tutoria-matematica-api
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: (dejar vacío o poner `/`)

### Paso 3: Variables de Entorno
En la sección "Environment Variables", añade:
- `OPENAI_API_KEY`: tu API key de OpenAI
- `MODEL_NAME`: `gpt-4o-mini`
- `NODE_ENV`: `production`

### Paso 4: Deploy
Click en "Create Web Service" y espera a que se despliegue.

Tu API estará disponible en: `https://tu-servicio.onrender.com`

## 🔐 Seguridad

- ✅ La API key de OpenAI NUNCA se expone al frontend
- ✅ Todas las llamadas a OpenAI se hacen desde el backend
- ✅ CORS configurado para aceptar requests del frontend
- ✅ Validación de inputs en todos los endpoints

## 💰 Costos

**Modelo usado:** `gpt-4o-mini`
- Costo aproximado: $0.00015 por request (150 tokens promedio)
- 1000 requests ≈ $0.15 USD
- Muy económico para MVP y producción inicial

## 🧪 Testing

### Test manual con curl:

```bash
curl -X POST http://localhost:3001/api/tutor/respond \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "sessionId": "test-session",
    "exerciseId": "ej1",
    "grade": "1sec",
    "topic": "Ecuaciones lineales",
    "studentAnswer": "5",
    "attemptNumber": 1,
    "mode": "text",
    "exercisePrompt": "¿Cuánto es 2x + 3 = 11? Resuelve para x.",
    "hintAllowed": false
  }'
```

## 📝 Prompts Implementados

### P01 - Tutor Base
- Tono empático y paciente
- Guía paso a paso
- No da respuestas finales
- Refuerzo positivo

### P07 - Reglas Duras
- Prohibido dar respuesta directa
- Prioriza preguntas sobre explicaciones
- Máximo 3 pasos por respuesta
- Usa "🧠 El error es útil para aprender"

## 🔧 Troubleshooting

**Error: OPENAI_API_KEY no configurada**
- Verifica que el archivo `.env` existe
- Verifica que la variable está correctamente escrita
- Reinicia el servidor después de cambiar `.env`

**Error 401 de OpenAI**
- Verifica que tu API key es válida
- Verifica que tienes créditos en tu cuenta de OpenAI

**Error 429 (Rate Limit)**
- Has excedido el límite de requests
- Espera unos minutos antes de intentar de nuevo
- Considera actualizar tu plan de OpenAI

## 📚 Estructura de Archivos

```
server/
├── index.js              # Servidor Express principal
├── prompts/
│   └── tutor.js         # Prompts P01 y P07
├── package.json          # Dependencias
├── .env.example         # Template de variables de entorno
└── README.md            # Esta documentación
```