# 📊 Media Manager

**Plataforma SaaS inteligente para gerenciamento de campanhas Meta Ads com sugestões alimentadas por IA.**

[![Build Status](https://github.com/seu-user/media-manager/actions/workflows/deploy.yml/badge.svg)](https://github.com/seu-user/media-manager/actions)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

## 🎯 Visão Geral

Media Manager é uma plataforma empresarial que oferece:

- 📱 **Dashboard Inteligente**: Visualizar todas as campanhas Meta Ads em tempo real
- 🤖 **Sugestões de IA**: Recomendações automáticas para otimizar ROI
- 📊 **Analytics Avançados**: Métricas detalhadas e insights preditivos
- ⚙️ **Automação**: Regras customizáveis para otimização automática
- 🔔 **Notificações**: Alertas em tempo real para eventos críticos
- 🛡️ **Segurança**: RLS policies, audit logging, e compliance GDPR

## 🚀 Quick Start

### Pré-Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Conta Supabase
- Conta Meta Developer (para OAuth)
- Chave Resend (para email)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-user/media-manager.git
cd media-manager

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
nano .env.local

# Execute em desenvolvimento
npm run dev
```

Acesse em `http://localhost:3000`

## 📚 Documentação

- [Deployment Guide](./DEPLOYMENT.md) - Como fazer deploy em produção
- [API Documentation](./docs/api.md) - Documentação das APIs
- [Architecture](./docs/ARCHITECTURE.md) - Visão geral técnica
- [Database Schema](./docs/DATABASE.md) - Schema PostgreSQL

## 🏗️ Arquitetura

### Frontend
- **Next.js 14** com App Router
- **React 18** para componentes
- **TypeScript** para type safety
- **Tailwind CSS** para styling
- **Recharts** para gráficos

### Backend
- **Supabase** para database (PostgreSQL)
- **Supabase Auth** para autenticação
- **Edge Functions** (Deno) para lógica serverless
- **Next.js API Routes** para REST APIs

### Integrações
- **Meta Marketing API v21** para campanhas
- **Resend** para envio de emails
- **PostgreSQL** para data persistence

## 📋 Features Principais

### Epic 1: Infraestrutura & Autenticação
- ✅ Autenticação com Supabase
- ✅ OAuth com Meta
- ✅ RLS policies para segurança
- ✅ Audit logging

### Epic 2: Meta Ads API Integration
- ✅ Sincronização de campanhas
- ✅ Refresh de tokens
- ✅ Recuperação de métricas
- ✅ Listagem de ad accounts

### Epic 3: Dashboard & Analytics
- ✅ Dashboard com KPIs
- ✅ Gráficos de performance
- ✅ Filtros avançados
- ✅ Exportação de dados

### Epic 4: AI Suggestions
- ✅ Geração de sugestões
- ✅ Priorização automática
- ✅ Recomendações contextuais
- ✅ Impact estimation

### Epic 5: Rules Engine
- ✅ Criação de regras
- ✅ Execução automática
- ✅ Ações customizáveis
- ✅ Histórico de execução

### Epic 6: Notifications & Audit
- ✅ Sistema de notificações
- ✅ Audit logging completo
- ✅ Alertas em tempo real
- ✅ Email notifications

## 📊 Métricas & Dados

### Dados Inclusos (Seed Data)
- 2 Ad Accounts de exemplo
- 3 Campanhas com histórico de performance
- 9 Ad Sets para A/B testing
- 3 Ads para testes
- Métricas históricas de 3 dias
- 3 Notificações de exemplo
- 3 Sugestões de IA

### Métricas Capturadas
- Spend diário
- Impressões
- Clicks & CTR
- CPC & CPM
- Conversões & CPA
- ROAS
- Performance trends

## 🔒 Segurança

- **Autenticação**: OAuth 2.0 com Meta + Supabase Auth
- **Autorização**: Row Level Security (RLS) em todas tabelas
- **Criptografia**: Tokens e dados sensíveis criptografados em repouso
- **Auditoria**: Todos eventos registrados com user ID e timestamp
- **Rate Limiting**: Limites em APIs para evitar abuse
- **Validação**: Validação de UUID, limites de pagination, sanitização de inputs

## 🧪 Testes

```bash
# Rodar todos os testes
npm run test

# Rodar testes em watch mode
npm run test:watch

# Checar cobertura
npm run test -- --coverage
```

**Cobertura Target**: 70%+ (auth, API endpoints, Edge Functions)

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev          # Iniciar em desenvolvimento
npm run build        # Build para produção
npm start            # Iniciar servidor de produção
npm run lint         # Checar código com ESLint
npm run typecheck    # Type checking com TypeScript
npm run test         # Rodar testes
npm run doctor       # Validação do projeto AIOS
```

### Estrutura do Projeto

```
media-manager/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   ├── lib/              # Utilitários e helpers
│   ├── hooks/            # Custom hooks
│   └── styles/           # CSS global
├── supabase/
│   ├── functions/        # Edge Functions (Deno)
│   └── migrations/       # Database migrations
├── docs/                 # Documentação
├── .github/workflows/    # CI/CD pipelines
└── public/               # Assets estáticos
```

## 🚀 Deployment

### Ambiente de Staging
```bash
git checkout develop
git push origin develop  # Dispara CI/CD automático
```

### Ambiente de Produção
```bash
git checkout main
git merge develop
git push origin main     # Dispara deployment automático
```

Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções detalhadas.

## 📞 Suporte & Contribuição

### Reportar Issues
1. Abra uma [GitHub Issue](https://github.com/seu-user/media-manager/issues)
2. Descreva o problema com detalhes
3. Inclua logs e steps para reproduzir

### Contribuir
1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 License

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

## 🎓 Desenvolvido com AIOS

Esta plataforma foi desenvolvida usando **Synkra AIOS**, um framework de IA para desenvolvimento full-stack orchestrado por agentes especializados.

[Saiba mais sobre AIOS →](https://github.com/SynkraAI/aios-core)

---

**Desenvolvido com ❤️ por Media Manager Team**

**Status**: ✅ Pronto para produção | **Versão**: 0.1.0 | **Última Atualização**: 2026-03
