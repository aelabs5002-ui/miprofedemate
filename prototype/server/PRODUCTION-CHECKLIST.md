# ✅ CHECKLIST DE PRODUCCIÓN - Backend Tutoría Matemática IA

## 📋 Pre-Deploy Verification

### Backend Readiness
- [x] `index.js` escucha en `process.env.PORT` (línea 11)
- [x] `package.json` tiene script `"start": "node index.js"`
- [x] No hay paths hardcodeados (todo usa variables de entorno)
- [x] CORS configurable con `FRONTEND_ORIGIN`
- [x] Health check implementado en `/health`
- [x] Manejo de errores de OpenAI (401, 429, 500)
- [x] Logs informativos en consola
- [x] Dependencies instaladas: express, cors, dotenv, openai

### Código Listo
- [x] Prompts P01 y P07 implementados en `/prompts/tutor.js`
- [x] Endpoint `/api/tutor/respond` funcional
- [x] Validación de inputs en endpoint
- [x] nextAction basado en contenido de respuesta IA
- [x] Fallback local en frontend si backend no disponible

---

## 🚀 Deploy en Render

### Configuración del Servicio
- [ ] Web Service creado en Render
- [ ] Repositorio conectado
- [ ] Root Directory: `prototype/server` ⚠️
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Plan seleccionado (Free o Starter)

### Variables de Entorno
- [ ] `OPENAI_API_KEY` configurada (sk-proj-...)
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_ORIGIN` configurada (URL del frontend)
- [ ] `MODEL_NAME` = `gpt-4o-mini` (opcional, tiene default)
- [ ] ⚠️ NO setear `PORT` (Render lo asigna automáticamente)

### Deploy Exitoso
- [ ] Logs muestran: "🚀 Servidor corriendo en puerto XXXXX"
- [ ] Logs muestran: "📊 Modelo: gpt-4o-mini"
- [ ] Logs muestran: "🔑 API Key configurada: ✅"
- [ ] Sin errores en los logs
- [ ] Estado del servicio: "Live" (verde)

---

## 🧪 Testing Post-Deploy

### 1. Backend Health Check
- [ ] Abrir: `https://tu-backend.onrender.com/health`
- [ ] Respuesta incluye:
  - [ ] `"status": "ok"`
  - [ ] `"model": "gpt-4o-mini"`
  - [ ] `"uptime": <número>`
  - [ ] `"timestamp": <ISO date>`
  - [ ] `"env": "production"`

### 2. Backend API Endpoint
- [ ] Test con curl o Postman:
  ```bash
  curl -X POST https://tu-backend.onrender.com/api/tutor/respond \
    -H "Content-Type: application/json" \
    -d '{"exercisePrompt":"2+2=?","studentAnswer":"4","attemptNumber":1,"mode":"text","hintAllowed":false}'
  ```
- [ ] Respuesta incluye:
  - [ ] `assistantText` (string con feedback)
  - [ ] `nextAction` ("retry", "hint", o "next")
  - [ ] `meta.tokensIn` (número)
  - [ ] `meta.tokensOut` (número)

### 3. Frontend Configuration
- [ ] Archivo `.env.production` creado en `/workspace/prototype`
- [ ] `VITE_API_URL` apunta a Render: `https://tu-backend.onrender.com`
- [ ] Frontend buildeado: `pnpm run build`
- [ ] Frontend desplegado (Vercel/Netlify/otro)

### 4. CORS Verification
- [ ] `FRONTEND_ORIGIN` en Render coincide con URL del frontend
- [ ] Abrir frontend desplegado
- [ ] Abrir DevTools → Console
- [ ] NO hay errores CORS
- [ ] NO hay errores de red (Network tab)

### 5. Flujo Completo End-to-End
- [ ] Abrir frontend desplegado
- [ ] Navegar a pantalla "Misión"
- [ ] Click en "Empezar sesión"
- [ ] Pantalla C4 se carga correctamente
- [ ] Badge "🤖 Tutor IA activo" visible (NO "Modo offline")
- [ ] Responder un ejercicio
- [ ] Feedback del tutor IA aparece en <5 segundos
- [ ] Feedback usa lenguaje pedagógico (no dice "incorrecto")
- [ ] nextAction controla botones correctamente:
  - [ ] "Siguiente" si respuesta correcta
  - [ ] "Enviar" si debe reintentar
- [ ] Completar ejercicio → avanza al siguiente
- [ ] Completar todos → vuelve a Misión

### 6. Fallback Local (Resiliencia)
- [ ] En Render Dashboard → Suspend el servicio temporalmente
- [ ] Recargar frontend
- [ ] Empezar sesión
- [ ] Badge cambia a "Modo offline"
- [ ] Responder ejercicio
- [ ] Validación local funciona (feedback genérico)
- [ ] App NO se rompe
- [ ] En Render Dashboard → Resume el servicio
- [ ] Recargar frontend
- [ ] Badge vuelve a "🤖 Tutor IA activo"

---

## 📊 Monitoring & Maintenance

### Logs
- [ ] Revisar logs en Render Dashboard → Logs
- [ ] Buscar errores o warnings
- [ ] Verificar que requests se registran:
  ```
  📝 Request: user=..., session=..., exercise=..., attempt=...
  ✅ Response: XX tokens, XXXms, action=...
  ```

### Performance
- [ ] Primera request (cold start): <30 segundos
- [ ] Requests subsecuentes: <5 segundos
- [ ] Tokens por request: 150-300 (promedio)
- [ ] Costo por request: ~$0.00015 USD

### Alertas
- [ ] Configurar alertas en Render (opcional):
  - [ ] Deploy failed
  - [ ] Service down
  - [ ] High error rate

### OpenAI Usage
- [ ] Revisar uso en https://platform.openai.com/usage
- [ ] Verificar que no hay picos anormales
- [ ] Confirmar que hay créditos suficientes

---

## 🐛 Troubleshooting Checklist

### Si Backend no responde:
- [ ] Verificar estado en Render Dashboard (debe ser "Live")
- [ ] Revisar logs para errores
- [ ] Verificar que OPENAI_API_KEY es válida
- [ ] Verificar que Root Directory es correcto
- [ ] Intentar Manual Deploy

### Si hay errores CORS:
- [ ] Verificar que FRONTEND_ORIGIN está seteada
- [ ] Verificar que coincide EXACTAMENTE con URL del frontend
- [ ] NO incluir trailing slash en FRONTEND_ORIGIN
- [ ] Verificar que frontend usa la URL correcta de backend

### Si IA no responde:
- [ ] Verificar API key en OpenAI Dashboard
- [ ] Verificar que hay créditos disponibles
- [ ] Revisar logs para errores 401 o 429
- [ ] Test directo con curl al endpoint

### Si servicio se duerme (Free Plan):
- [ ] Es normal en Free Plan después de 15 min inactividad
- [ ] Primera request despertará el servicio (~30 seg)
- [ ] Considerar upgrade a Starter Plan ($7/mes) para 24/7

---

## 🎯 Success Criteria

El deploy es exitoso cuando:

✅ Backend responde `/health` con status 200
✅ Backend responde `/api/tutor/respond` con feedback de IA
✅ Frontend conecta sin errores CORS
✅ Flujo completo funciona: Misión → Sesión → IA responde → Avanza
✅ Fallback local funciona si backend no disponible
✅ Logs muestran requests exitosos
✅ Costos están dentro de lo esperado (~$0.00015/request)

---

## 📝 Post-Deploy Actions

- [ ] Documentar URL del backend en README principal
- [ ] Compartir URL de producción con el equipo
- [ ] Configurar monitoreo (opcional: UptimeRobot, Pingdom)
- [ ] Configurar backups de variables de entorno
- [ ] Planear siguiente iteración (más ejercicios, persistencia, etc.)

---

## ✅ CONFIRMACIÓN FINAL

- [ ] **Backend listo para producción en Render** ✅
- [ ] **Frontend conectado y funcionando** ✅
- [ ] **IA respondiendo correctamente** ✅
- [ ] **Fallback local funciona** ✅
- [ ] **Documentación completa** ✅

**Fecha de Deploy:** _________________

**URL Backend:** _________________

**URL Frontend:** _________________

**Deployed by:** _________________

---

🎉 **¡Producción lista!** El sistema está funcionando end-to-end con IA en la nube.