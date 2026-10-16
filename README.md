# Oráculo Lunar + IA (clave protegida)

Este proyecto toma la app de Tarot de 78 cartas y añade interpretación mediante Gemini. La clave NO va dentro del HTML: se configura como variable secreta del servidor (`GEMINI_API_KEY`). El navegador llama a `/api/tarot`, y el servidor llama a Gemini.

## Antes de publicar

1. Crea una clave en https://aistudio.google.com/apikey. No la compartas ni la pegues en `index.html`.
2. Sube todos los archivos de esta carpeta a un repositorio privado o público de GitHub. No incluyas tu clave en GitHub.
3. En Render, crea un servicio web nuevo conectado al repositorio. Puedes usar el `render.yaml` incluido.
4. En la sección **Environment** del servicio, añade `GEMINI_API_KEY` con tu clave secreta. Deja `GEMINI_MODEL` como `gemini-2.5-flash` salvo que tu cuenta/modelo disponible indique otra cosa.
5. Despliega. Al terminar, Render te dará una URL pública `https://...onrender.com`.
6. Abre la URL, escribe una sola pregunta, selecciona tres cartas y pulsa “Revelar mi lectura”.

## Importante

- El nivel gratuito de Gemini está sujeto a disponibilidad, cuota y límites; no es ilimitado ni se garantiza que nunca genere cargos. Revisa los términos y límites de tu cuenta antes de compartir la web ampliamente.
- El plan gratuito del hosting puede dormir tras inactividad y tardar en despertar.
- La app limita el endpoint a 20 solicitudes por IP cada 15 minutos. Esto reduce abuso, pero no sustituye un sistema completo de cuentas/autenticación.
- La clave solo existe en el servidor. No la pongas en HTML, JavaScript público ni repositorio.
- El tarot es una lectura simbólica y no una predicción garantizada.
