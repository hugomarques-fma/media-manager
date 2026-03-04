# Deployment Guide - Media Manager

## Visão Geral

Este documento descreve como fazer deploy da plataforma **Media Manager** em diferentes ambientes (local, staging, produção).

## Pré-Requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **Conta Supabase** (para database)
- **Conta Vercel** (para hosting)
- **Meta Developer Account** (para integração com APIs)
- **Resend Account** (para email)

## Configuração Local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-user/media-manager.git
cd media-manager
```

### 2. Instale dependências

```bash
npm install
```

### 3. Configure variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite com suas credenciais
nano .env.local
```

### 4. Setup do banco de dados

```bash
# Se usando Supabase local (recomendado para desenvolvimento)
npx supabase start

# Se usando Supabase cloud, apenas configure as env vars
# Depois execute seed data
psql -h your-project.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

### 5. Execute em desenvolvimento

```bash
npm run dev
```

Acesse em http://localhost:3000

## Deployment em Staging

### Via GitHub Actions (Automático)

1. Faça push para a branch `develop`:
```bash
git checkout develop
git push origin develop
```

2. O workflow `.github/workflows/deploy.yml` será acionado automaticamente
3. Acesse o link de staging na saída do GitHub Actions

### Via Vercel (Manual)

```bash
npm install -g vercel

# Login no Vercel
vercel login

# Deploy em staging
vercel --prod=false
```

## Deployment em Produção

### Via GitHub Actions (Automático)

1. Faça merge para `main`:
```bash
git checkout main
git merge develop
git push origin main
```

2. O workflow acionará deployment automático em produção
3. Monitoring e alertas serão acionados via Slack

### Checklist pré-deployment

- [ ] Todos os testes passando (`npm run test`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Type check sem erros (`npm run typecheck`)
- [ ] Build sem erros (`npm run build`)
- [ ] Variáveis de ambiente configuradas em produção
- [ ] Database migrations aplicadas
- [ ] Backups do banco realizados
- [ ] SSL/TLS certificado válido

## Configuração de Variáveis de Ambiente

### Desenvolvimento

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (local key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (local service key)
META_CLIENT_ID=your_test_app_id
META_CLIENT_SECRET=your_test_secret
RESEND_API_KEY=re_test_key
```

### Staging

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (staging key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (staging service key)
META_CLIENT_ID=your_staging_app_id
META_CLIENT_SECRET=your_staging_secret
RESEND_API_KEY=re_staging_key
```

### Produção

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (prod key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (prod service key)
META_CLIENT_ID=your_prod_app_id
META_CLIENT_SECRET=your_prod_secret
RESEND_API_KEY=re_prod_key
```

## Edge Functions Deployment

### Deploy para Supabase

```bash
# Login no Supabase CLI
supabase login

# Deploy todas as functions
supabase functions deploy

# Deploy função específica
supabase functions deploy refresh-tokens
supabase functions deploy sync-campaigns
supabase functions deploy send-notification-email
supabase functions deploy capture-metrics
supabase functions deploy generate-suggestions
supabase functions deploy send-daily-digest
supabase functions deploy process-scheduled-reports
supabase functions deploy cleanup-old-data
```

### Logs das Edge Functions

```bash
# Ver logs em tempo real
supabase functions logs refresh-tokens
supabase functions logs sync-campaigns

# Com filtro
supabase functions logs sync-campaigns --filter "[ERROR]"
```

## Monitoramento

### Health Checks

```bash
# Verificar status da API
curl https://your-domain.com/api/health

# Verificar status do banco
curl https://your-domain.com/api/db-health
```

### Métricas Importantes

- **Uptime**: Target 99.9%
- **Response Time**: < 200ms (p95)
- **Error Rate**: < 0.1%
- **Database Connections**: Monitor pool usage

### Logs e Alertas

- **Application Logs**: Vercel dashboard
- **Database Logs**: Supabase dashboard
- **Alertas**: Configurar em Sentry/Monitoring
- **Email Alerts**: Via Resend dashboard

## Troubleshooting

### Erro: "Missing environment variables"

```
Solução: Verifique se todas as variáveis em .env.local estão preenchidas
```

### Erro: "Failed to connect to database"

```
Solução:
1. Verifique NEXT_PUBLIC_SUPABASE_URL está correto
2. Verifique SUPABASE_SERVICE_ROLE_KEY está válida
3. Verifique acesso à rede (firewall rules)
```

### Erro: "Meta API error"

```
Solução:
1. Verifique META_CLIENT_ID e META_CLIENT_SECRET
2. Verifique se tokens dos ad_accounts estão válidos
3. Refreshe tokens se necessário
```

### Erro: "Failed to send email"

```
Solução:
1. Verifique RESEND_API_KEY está válida
2. Verifique endereço de email está formatado corretamente
3. Verifique rate limits do Resend
```

## Rollback

### Se deployment falhou

```bash
# Revert para versão anterior no Vercel
vercel --prod rollback

# Ou via GitHub (revert commit)
git revert <commit-hash>
git push origin main
```

## Performance Tips

1. **Caching**: Habilitar HTTP caching no Vercel
2. **Database**: Usar connection pooling em produção
3. **Images**: Otimizar com Next.js Image component
4. **Bundles**: Monitorar bundle size com `npm run build`
5. **API**: Rate limit via middleware

## Security Checklist

- [ ] Todas as variáveis sensíveis em secrets (não em código)
- [ ] HTTPS habilitado
- [ ] CORS configurado corretamente
- [ ] Rate limiting em APIs
- [ ] RLS policies ativas no Supabase
- [ ] Database backups automáticos
- [ ] Access logs habilitados
- [ ] Audit logging ativo

## Contato & Suporte

- **Issues**: GitHub Issues
- **Documentation**: `/docs`
- **Email**: support@media-manager.local
