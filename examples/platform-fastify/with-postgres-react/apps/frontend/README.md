# Fastify + PostgreSQL React Frontend

Minimal React + Vite + Tailwind client for the Fastify + PostgreSQL example.

## ✅ Features

- Create, list, filter, delete greetings
- Fetch a random greeting by language
- Tailwind UI with a simple single-page layout
- Vite proxy to avoid CORS in development

## 🚀 Quick Start

1. Start the API server (from the example root):

   - Install dependencies
   - Run the Fastify dev server on http://localhost:3001

2. Start the frontend (from this folder):
   - Install dependencies
   - Run Vite dev server on http://localhost:5173

## Environment

- `VITE_API_BASE` (optional) set a full API base URL for production builds.

## Notes

- File names are lowercase to match repository conventions.
- Proxy rule forwards `/api/*` and `/greetings` to http://localhost:8083.
