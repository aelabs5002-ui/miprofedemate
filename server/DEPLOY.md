# 🚀 GUÍA DE DEPLOY EN RENDER - Backend Tutoría Matemática IA

Esta guía detalla los pasos exactos para desplegar el backend en Render y conectarlo con el frontend.

## ✅ Pre-requisitos

- Cuenta en [Render.com](https://render.com) (plan gratuito funciona)
- Repositorio Git con el código (GitHub, GitLab, o Bitbucket)
- API Key de OpenAI válida con créditos

---

## 📦 PASO 1: Verificar Readiness del Backend

Antes de desplegar, confirma que el backend está listo:

✅ **index.js escucha en `process.env.PORT`** (línea 11)
```javascript
const PORT = process.env.PORT || 3001;
```

✅ **package.json tiene script "start"**
```json
"scripts": {
  "start": "node index.js"
}
```

✅ **No hay dependencias locales hardcodeadas** - Todo usa variables de entorno

✅ **CORS configurable** - Soporta `FRONTEND_ORIGIN` para producción

---

## 🌐 PASO 2: Crear Web Service en Render

### 2.1. Acceder a Render Dashboard
1. Ve a https://dashboard.render.com/
2. Click en **"New +"** (botón azul superior derecho)
3. Selecciona **"Web Service"**

### 2.2. Conectar Repositorio
1. Conecta tu cuenta de GitHub/GitLab/Bitbucket si aún no lo has hecho
2. Busca y selecciona tu repositorio del proyecto
3. Click en **"Connect"**

### 2.3. Configurar el Servicio

Completa el formulario con estos valores EXACTOS:

| Campo | Valor |
|-------|-------|
| **Name** | `tutoria-matematica-api` (o el nombre que prefieras) |
| **Region** | Selecciona la más cercana a tus usuarios |
| **Branch** | `main` (o tu rama principal) |
| **Root Directory** | `prototype/server` ⚠️ IMPORTANTE |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` (o el plan que prefieras) |

⚠️ **CRÍTICO**: El **Root Directory** debe ser exactamente `prototype/server` para que Render encuentre el package.json correcto.

---

## 🔐 PASO 3: Configurar Variables de Entorno

En la sección **"Environment Variables"**, añade estas variables:

### Variables Obligatorias:

| Key | Value | Descripción |
|-----|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Tu API key de OpenAI |
| `NODE_ENV` | `production` | Entorno de producción |
| `FRONTEND_ORIGIN` | `https://tu-frontend.vercel.app` | URL de tu frontend (cambiar después) |

⚠️ **NO SETEAR `PORT`** - Render lo asigna automáticamente.

### Cómo añadir variables:
1. Click en **"Add Environment Variable"**
2. Ingresa **Key** y **Value**
3. Repite para cada variable
4. Click en **"Save Changes"**

---

## 🚀 PASO 4: Desplegar

1. Click en **"Create Web Service"** (botón azul al final)
2. Render comenzará el deploy automáticamente
3. Espera 2-5 minutos mientras:
   - Clona el repositorio
   - Ejecuta `npm install`
   - Inicia el servidor con `npm start`

### Monitorear el Deploy:
- Ve a la pestaña **"Logs"** para ver el progreso en tiempo real
- Busca estos mensajes de éxito:
  ```
  🚀 Servidor corriendo en puerto XXXXX
  📊 Modelo: gpt-4o-mini
  🔑 API Key configurada: ✅
  ```

### URL del Servicio:
Una vez desplegado, tu backend estará disponible en:
```
https://tutoria-matematica-api.onrender.com
```
(El nombre depende del que elegiste en el paso 2.3)

---

## 🧪 PASO 5: Verificar el Deploy

### 5.1. Probar Health Check

Abre en tu navegador o usa curl:

```bash
curl https://tutoria-matematica-api.onrender.com/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "model": "gpt-4o-mini",
  "uptime": 123.45,
  "timestamp": "2024-01-15T10:30:45.123Z",
  "env": "production"
}
```

✅ Si ves esta respuesta, el backend está funcionando correctamente.

### 5.2. Probar Endpoint del Tutor

```bash
curl -X POST https://tutoria-matematica-api.onrender.com/api/tutor/respond \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "sessionId": "test-session",
    "exerciseId": "ej1",
    "grade": "1sec",
    "topic": "Ecuaciones lineales",
    "studentAnswer": "4",
    "attemptNumber": 1,
    "mode": "text",
    "exercisePrompt": "¿Cuánto es 2x + 3 = 11? Resuelve para x.",
    "hintAllowed": false
  }'
```

**Respuesta esperada:**
```json
{
  "assistantText": "¡Muy bien! 🎯 Has encontrado la respuesta correcta...",
  "nextAction": "next",
  "meta": {
    "tokensIn": 245,
    "tokensOut": 42,
    "responseTime": 1250,
    "model": "gpt-4o-mini"
  }
}
```

---

## 🔗 PASO 6: Conectar el Frontend

### 6.1. Actualizar FRONTEND_ORIGIN en Render

1. Ve a tu servicio en Render Dashboard
2. Click en **"Environment"** en el menú lateral
3. Edita la variable `FRONTEND_ORIGIN`
4. Cambia el valor a la URL real de tu frontend:
   - Si usas Vercel: `https://tu-app.vercel.app`
   - Si usas Netlify: `https://tu-app.netlify.app`
   - Si usas otro: la URL correspondiente
5. Click en **"Save Changes"**
6. El servicio se reiniciará automáticamente

### 6.2. Configurar Frontend (Vite)

En tu proyecto frontend (`/workspace/prototype`):

1. **Crear archivo `.env.production`:**
   ```bash
   cd /workspace/prototype
   touch .env.production
   ```

2. **Añadir la URL del backend:**
   ```env
   VITE_API_URL=https://tutoria-matematica-api.onrender.com
   ```
   (Reemplaza con tu URL real de Render)

3. **Para desarrollo local, crear `.env.development`:**
   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Build y deploy del frontend:**
   ```bash
   pnpm run build
   # Luego despliega la carpeta dist/ en Vercel/Netlify
   ```

---

## ✅ PASO 7: Checklist de Pruebas Post-Deploy

Realiza estas pruebas en orden:

### 7.1. Backend Health Check
- [ ] Abrir `https://tu-backend.onrender.com/health`
- [ ] Verificar que responde con `status: "ok"`
- [ ] Verificar que `env: "production"`

### 7.2. Conectividad Frontend-Backend
- [ ] Abrir tu frontend desplegado
- [ ] Abrir DevTools → Console
- [ ] Verificar que NO hay errores CORS
- [ ] Verificar que NO hay errores de conexión

### 7.3. Flujo Completo de IA
- [ ] Ir a la pantalla "Misión"
- [ ] Click en "Empezar sesión"
- [ ] Responder un ejercicio
- [ ] Verificar que aparece feedback del tutor IA
- [ ] Verificar que el badge "🤖 Tutor IA activo" está visible
- [ ] Verificar que NO aparece "Modo offline"

### 7.4. Fallback Local (Opcional)
- [ ] Detener temporalmente el backend en Render (Suspend)
- [ ] Recargar el frontend
- [ ] Empezar sesión
- [ ] Verificar que aparece "Modo offline"
- [ ] Verificar que la validación local funciona
- [ ] Reactivar el backend (Resume)

---

## 🐛 Troubleshooting

### Error: "Cannot GET /"
**Causa:** Render no encuentra el index.js
**Solución:** Verifica que Root Directory sea `prototype/server`

### Error: "OPENAI_API_KEY no está configurada"
**Causa:** Variable de entorno no seteada
**Solución:** Ve a Environment en Render y añade la variable

### Error: CORS en el frontend
**Causa:** FRONTEND_ORIGIN no coincide con la URL del frontend
**Solución:** Actualiza FRONTEND_ORIGIN con la URL exacta (sin trailing slash)

### Error 401 de OpenAI
**Causa:** API key inválida o sin créditos
**Solución:** Verifica tu API key en https://platform.openai.com/api-keys

### El servicio se duerme (Free Plan)
**Causa:** Render Free duerme servicios inactivos después de 15 min
**Solución:** 
- Primera request será lenta (~30 segundos)
- Considera upgrade a plan Starter ($7/mes) para 24/7 uptime
- O implementa un ping cada 10 minutos desde un cron job externo

---

## 💰 Costos Estimados

### Render Free Plan:
- ✅ 750 horas/mes gratis
- ✅ Suficiente para MVP y testing
- ⚠️ Servicio se duerme tras 15 min de inactividad
- ⚠️ 100GB bandwidth/mes

### Render Starter Plan ($7/mes):
- ✅ Servicio 24/7 sin dormir
- ✅ 400GB bandwidth/mes
- ✅ Mejor para producción

### OpenAI (gpt-4o-mini):
- ~$0.00015 por interacción
- 1000 interacciones ≈ $0.15 USD
- Muy económico para MVP

---

## 📝 Comandos Útiles

### Ver logs en tiempo real:
```bash
# Desde Render Dashboard → Logs
# O usando Render CLI:
render logs -f tutoria-matematica-api
```

### Reiniciar el servicio:
```bash
# Desde Render Dashboard → Manual Deploy → Deploy latest commit
```

### Actualizar variables de entorno:
```bash
# Render Dashboard → Environment → Edit → Save Changes
# El servicio se reinicia automáticamente
```

---

## 🎯 Resumen de URLs

| Servicio | URL | Propósito |
|----------|-----|-----------|
| Backend Health | `https://tu-backend.onrender.com/health` | Verificar estado |
| Backend API | `https://tu-backend.onrender.com/api/tutor/respond` | Endpoint principal |
| Frontend | `https://tu-frontend.vercel.app` | Aplicación web |
| Render Dashboard | `https://dashboard.render.com` | Gestión del backend |
| OpenAI Dashboard | `https://platform.openai.com` | Gestión de API keys |

---

## ✅ Confirmación Final

Una vez completados todos los pasos:

- ✅ Backend desplegado en Render
- ✅ Health check responde correctamente
- ✅ Variables de entorno configuradas
- ✅ CORS configurado con FRONTEND_ORIGIN
- ✅ Frontend conectado al backend
- ✅ Flujo completo de IA funcionando
- ✅ Fallback local funciona si backend no disponible

**🎉 ¡Backend listo para producción en Render!**

---

## 📞 Soporte

- **Render Docs:** https://render.com/docs
- **OpenAI Docs:** https://platform.openai.com/docs
- **Issues del Proyecto:** [Tu repositorio]/issues