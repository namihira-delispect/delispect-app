# DELISPECT - Claude Code Configuration

## Repository Structure

```
delispect-app/
├── apps/
│   └── web/                    # Next.js Web Application
├── packages/
│   └── db/                     # Prisma Schema & DB Client
├── docs/                       # Design documents & standards
├── docker-compose.yml          # Development environment
├── pnpm-workspace.yaml         # Monorepo workspace config
├── tsconfig.base.json          # Shared TypeScript config
└── package.json                # Root workspace config
```

## Tech Stack

- **Language**: TypeScript
- **Framework**: Next.js (App Router)
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Package Manager**: pnpm (workspace)
- **Container**: Docker / Docker Compose
- **Test**: Vitest
- **Lint**: ESLint
- **Format**: Prettier

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build all packages

# Quality checks
pnpm lint                   # Run ESLint across all packages
pnpm typecheck              # Run TypeScript type checking
pnpm test                   # Run all tests
pnpm format:check           # Check formatting

# Database
pnpm db:generate            # Generate Prisma client
pnpm db:migrate:dev         # Run migrations (dev)
pnpm db:push                # Push schema to DB
```

## Coding Conventions

- See `docs/standards/coding-guidelines.md`
- Naming: camelCase for functions/files, PascalCase for components/types
- Error handling: Result type pattern
- Testing: Vitest, Japanese test descriptions
- Commit format: Conventional Commits
