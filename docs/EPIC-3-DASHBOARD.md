# Epic 3: Dashboard & Visualizações

**Status:** 📋 Planejado
**Prioridade:** 🟠 Alta (Fase 1-2)
**Estimativa:** 3 semanas
**Owner:** @pm (Morgan)
**Dependências:** Epic 1, 2

---

## Visão Geral

Implementar dashboard gerencial completo com KPIs, gráficos, filtros e visualizações interativas conforme PRD seção 4.

## Objetivos

- ✅ Cards de KPI com deltas
- ✅ Gráfico de evolução temporal
- ✅ Tabela de campanhas com paginação
- ✅ Gráficos de distribuição
- ✅ Heatmap de performance
- ✅ Filtros globais (período, conta, campanha, status)
- ✅ Exportação CSV/Excel

## Stories Esperadas

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| 3.1 | Layout & estrutura do dashboard | Baixa |
| 3.2 | Cards de KPI com deltas | Baixa |
| 3.3 | Gráfico temporal com Recharts | Média |
| 3.4 | Tabela de campanhas | Média |
| 3.5 | Distribuição de gastos (pizza/barras) | Baixa |
| 3.6 | Heatmap hora/dia | Alta |
| 3.7 | Painel de anúncios (grid) | Média |
| 3.8 | Filtros globais | Média |
| 3.9 | Exportação CSV/Excel | Baixa |
| 3.10 | Responsividade mobile | Média |

## Dependências

- Epic 1: Infraestrutura ✓
- Epic 2: Meta API Sync ✓

## Acceptance Criteria

- [ ] Dashboard carrega em < 3 segundos (P95)
- [ ] Todos os gráficos interativos e responsivos
- [ ] Filtros globais funcionam em tempo real
- [ ] Dados atualizam sem reload (ideal: Realtime Supabase)
- [ ] Exportação gera arquivos válidos
- [ ] Acessível (WCAG AA)
- [ ] Funcional em mobile (sem UX quebrada)

## Componentes Principais

- KPI Cards (spend, conversions, CPA, ROAS)
- Timeline Chart (métricas vs. tempo)
- Campaign Table (sort, filter, pagination)
- Spend Distribution (pie/bar)
- Performance Heatmap (hora x dia)
- Ad Panel (grid com criativos)
- Filter Bar (período, conta, campanha, status)
