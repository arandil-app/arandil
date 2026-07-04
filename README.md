# Arandil

> Plataforma global de aprendizaje de matemáticas con IA, enfocada en mastery learning.

**Filosofía:** Falla rápido, aprende, reintenta, repite hasta dominar.

---

## Stack

| Capa | Tecnología |
|------|------------|
| **App mobile** | React Native + Expo 52 + Expo Router |
| **Backend** | Node.js 20 + Express |
| **Base de datos** | PostgreSQL 15+ (sin ORM, pg driver puro) |
| **Auth** | Supabase Auth |
| **Storage** | Cloudflare R2 |
| **IA principal** | DeepSeek V3 |
| **SRS** | FSRS-7 (ts-fsrs) |
| **Jobs** | BullMQ + Redis |
| **Monorepo** | pnpm workspaces + Turborepo |

---

## Estructura

```
arandil/
├── apps/
│   └── mobile/          # React Native + Expo app
├── services/
│   └── api/             # Express backend
├── packages/
│   └── core/            # FSRS-7, BKT, IRT (algoritmos puros)
├── infra/
│   ├── docker-compose.yml
│   └── scripts/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Setup Local

### Prerrequisitos
- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL + Redis)

### Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar PostgreSQL + Redis
pnpm docker:dev

# 3. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Aplicar migraciones
pnpm db:migrate

# 5. Correr API + Mobile en paralelo
pnpm dev
```

---

## Scripts

```bash
pnpm dev          # API + mobile en paralelo (Turborepo)
pnpm build        # Build de todos los workspaces
pnpm test         # Tests de todos los workspaces
pnpm lint         # Lint de todos los workspaces
pnpm db:migrate   # Aplicar migraciones SQL
pnpm db:seed      # Seed inicial
pnpm docker:dev   # Levantar PostgreSQL + Redis
pnpm docker:down  # Detener containers
```

---

## Documentación

Ver `/home/rodri/arandil-workspace/arandil-brain/` para:
- **VISION.md** — visión de producto
- **DECISIONS.md** — decisiones técnicas (DEC-001 a DEC-008)
- **ARCHITECTURE.md** — arquitectura del sistema
- **ROADMAP.md** — roadmap y fases
- **STATUS.md** — estado actual

---

## Reglas de Código

1. **pnpm only** — NUNCA npm ni yarn
2. **Sin ORM** — SQL puro con `pg`
3. **TypeScript strict** — sin `any`
4. **Zod en los bordes** — validar toda entrada externa
5. **packages/core es puro** — sin deps de React/Express/pg

Ver `CLAUDE.md` en workspace root para protocolo completo.

---

## Estado Actual

**Fase:** FASE 1 (Monorepo Base) — estructura creada  
**Próximo:** FASE 2 (API Base) — Express + Auth + Migraciones

Ver [ROADMAP](../arandil-brain/CURRENT/ROADMAP.md) para fases completas.

---

**Repositorio:** https://github.com/arandil-app/arandil  
**Brain:** https://github.com/arandil-app/arandil-brain
