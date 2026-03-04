# Epic 1: Infraestrutura & Autenticação

**Status:** 📋 Planejado
**Prioridade:** 🔴 Crítica (Fase 0 - Fundação)
**Estimativa:** 2 semanas
**Owner:** @pm (Morgan)

---

## Visão Geral

Estabelecer a fundação técnica da plataforma: banco de dados, autenticação, ambiente de desenvolvimento e infraestrutura de deployment.

## Objetivos

- ✅ Supabase PostgreSQL configurado e migrations criadas
- ✅ Autenticação Supabase Auth funcionando
- ✅ OAuth 2.0 com Meta Ads integrado
- ✅ Estrutura Next.js com TypeScript
- ✅ Ambiente de desenvolvimento local pronto
- ✅ CI/CD pipeline básico

## Stories Esperadas

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| 1.1 | Supabase setup & database schema | Media |
| 1.2 | RLS policies & segurança | Media |
| 1.3 | Supabase Auth configuration | Baixa |
| 1.4 | Meta OAuth 2.0 flow | Alta |
| 1.5 | Next.js project setup | Baixa |
| 1.6 | Environment & deployment config | Média |

## Dependências

- Nenhuma (foundational)

## Acceptance Criteria

- [ ] Banco de dados PostgreSQL pronto (schema criado)
- [ ] RLS policies testadas para isolamento por user
- [ ] Fluxo de registro/login funcionando
- [ ] Meta OAuth conectando e armazenando token criptografado
- [ ] Next.js dev server rodando localmente
- [ ] Migrations documentadas e versionadas
