# Simulador Laura — proyecto listo para desplegar

Este proyecto ya está completo: 5 herramientas de práctica (Sesión 1, Ventana de Johari, Sesión 2, Sesión 3, Sesión 4), cada una con su propio endpoint seguro en el servidor. Solo te faltan 3 pasos para tenerlo en vivo.

## Estructura

```
simulador-laura/
├── public/
│   ├── lh-mirror-icon.png  ← ícono de la marca (recortado del logo personal)
│   ├── index.html          ← página de inicio con enlaces a las 5 herramientas
│   ├── sesion1.html
│   ├── johari.html
│   ├── sesion2.html
│   ├── sesion3.html
│   └── sesion4.html
├── api/
│   ├── sesion1.js
│   ├── johari.js
│   ├── sesion2.js
│   ├── sesion3-chat.js
│   ├── sesion3-debrief.js
│   └── sesion4.js
└── package.json
```

## Paso 1 — Obtener tu clave de API

1. Crea una cuenta en [platform.claude.com](https://platform.claude.com) y agrega un método de pago.
2. Ve a **Settings → API Keys → Create Key**. Copia la clave (empieza con `sk-ant-...`) — solo se muestra una vez.

## Paso 2 — Subir este proyecto a GitHub

1. Crea un repositorio nuevo en GitHub (puede ser privado).
2. Sube esta carpeta completa tal cual está.

## Paso 3 — Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratuita.
2. Elige **"Import Project"** y selecciona tu repositorio de GitHub.
3. Antes de desplegar, en **Environment Variables**, agrega:
   - Nombre: `ANTHROPIC_API_KEY`
   - Valor: tu clave `sk-ant-...`
4. Haz clic en **Deploy**.

Vercel te entrega una URL pública, por ejemplo `https://simulador-laura.vercel.app`. Esa es la página de inicio con las 5 herramientas — o puedes enlazar directamente a una sola (por ejemplo, `https://simulador-laura.vercel.app/sesion1.html`) si prefieres un QR distinto por sesión.

## Antes del evento real

- Ábrelo tú misma de principio a fin, una vez por cada una de las 5 herramientas.
- Pide a 3-4 personas que lo abran al mismo tiempo, simulando el momento real.
- Genera los códigos QR de cada URL (por ejemplo, en qr-code-generator.com) y reemplaza los placeholders "QR / ENLACE AQUÍ" en las diapositivas y en el Pasaporte del Líder.

## Privacidad

Ninguna conversación se guarda en ningún lado — cada sesión existe solo mientras la página está abierta. Si más adelante quieres registrar respuestas para mejorar el contenido, eso requeriría agregar una base de datos y avisar explícitamente a los participantes antes de la sesión.

## Personalizar los escenarios

Cada escenario vive directamente en su archivo `.js` dentro de `/api`. Para cambiarlo (por ejemplo, rotar entre los 5 escenarios del Banco de Contenido que ya generamos), edita la variable `escenario` o `scenarios` en el archivo correspondiente y vuelve a subir los cambios — Vercel despliega automáticamente.
