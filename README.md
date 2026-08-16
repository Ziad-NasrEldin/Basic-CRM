# Basic CRM

A small client CRM you can run as a PWA — list or kanban, tasks and payments, English or Arabic.

Built for solo operators and small teams who need clients, follow-ups, and a simple pipeline without a heavyweight suite.

- Search clients by name or phone; drag them across status columns
- Attach a product, sale value, notes, tasks, and payment history to each client
- Get due-task reminders and export the list to Excel
- Switch the whole UI between English and Arabic
- Install it as a PWA, or ship it with the Docker files under crm-app/

## Run locally

The app lives in crm-app/. Needs Node.js and the node package manager. There is no public site on this repo.

```bash
cd crm-app
npm install
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Prisma uses SQLite (DATABASE_URL in the schema). Docker, PWA icons, and VPS notes live in [`docs/local-setup.md`](docs/local-setup.md) and crm-app/DEPLOY.md.

## How it works

Next.js (App Router) + Prisma/SQLite. The home page is the client list and kanban; each client has notes, tasks, and payments. Statuses and products are first-class records. Translations come from lib/translations/{en,ar}.json.

---

Built by [Ziad Ahmed](https://github.com/Ziad-NasrEldin) at [MaVoid](https://mavoid.com).

[Website](https://mavoid.com) · [LinkedIn](https://linkedin.com/in/ziad-ahmed-634202332) · [GitHub](https://github.com/Ziad-NasrEldin)
