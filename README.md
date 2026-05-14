# Consultoría en Marketing - Web

Sitio web de Consultoría en Marketing - Agencia de marketing digital con IA.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **Lenguaje**: TypeScript
- **IA Chatbot**: OpenAI / DeepSeek (fallback a respuestas basadas en reglas)

## Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
# OpenAI (opcional)
OPENAI_API_KEY=tu-api-key-aqui

# DeepSeek (alternativa a OpenAI)
DEEPSEEK_API_KEY=tu-api-key-aqui

# URL del sitio
NEXT_PUBLIC_SITE_URL=https://consultoriaenmarketing.com
```

## Desarrollo

```bash
npm run dev
```

## Build de Producción

```bash
npm run build
```

## Despliegue a Vercel

1. Conecta el repositorio a Vercel
2. Añade las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente

## Despliegue Manual

```bash
npm run build
npm run start
```

## Estructura del Proyecto

```
src/
├── app/                  # Páginas de Next.js
│   ├── api/             # API routes
│   ├── blog/            # Blog
│   ├── servicios/       # Página de servicios
│   ├── contacto/        # Formulario de contacto
│   └── presupuesto/     # Formulario de presupuesto
├── components/          # Componentes React
│   ├── layout/          # Header, Footer
│   ├── sections/        # Secciones de landing
│   ├── chatbot/         # Widget de chatbot
│   └── ui/              # Componentes shadcn/ui
└── lib/                 # Utilidades y datos
```