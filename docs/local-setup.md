# Basic CRM local setup

Product overview is in the root [README](../README.md). The Next.js app is in `crm-app/`.

## Stack

- Next.js 16 / React 19 / JavaScript
- Prisma on SQLite
- English and Arabic translations
- PWA manifest and service worker under crm-app/public

## Local run

```bash
cd crm-app
npm install
npx prisma generate
npm run dev
```

App: http://localhost:3000. Schema models: Client, ClientStatus, Product, Note, Task, Payment.

## Also in the repo

- crm-app/DEPLOY.md and crm-app/DOCKER_DEPLOYMENT.md — VPS / Docker notes
- crm-app/docker-compose.yml and Dockerfile
- crm-app/PWA_SETUP_GUIDE.md — installable app icons and manifest
- default-agent-skills/ — MaVoid agent skills, not required to run the CRM
