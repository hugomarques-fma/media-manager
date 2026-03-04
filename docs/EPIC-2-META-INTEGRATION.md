# Epic 2: Integração Meta Ads API

**Status:** 📋 Planejado
**Prioridade:** 🔴 Crítica (Fase 1)
**Estimativa:** 2,5 semanas
**Owner:** @pm (Morgan)
**Dependências:** Epic 1 ✓

---

## Visão Geral

Implementar sincronização bidirecional com Meta Marketing API: leitura de campanhas/métricas e execução de ações.

## Objetivos

- ✅ Sincronização automática de campanhas (horária)
- ✅ Armazenamento histórico de métricas (diário)
- ✅ Refresh de tokens automático
- ✅ Tratamento de rate limits com backoff
- ✅ Log completo de sincronizações
- ✅ Execução de ações via API

## Stories Esperadas

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| 2.1 | Meta Marketing API client setup | Média |
| 2.2 | Sincronização de campanhas/ad sets/ads | Média |
| 2.3 | Captura de métricas diárias | Média |
| 2.4 | Token refresh automático | Baixa |
| 2.5 | Rate limiting & backoff | Média |
| 2.6 | Execução de ações (pause, budget) | Alta |
| 2.7 | Dashboard de sync status | Baixa |

## Dependências

- Epic 1: Infraestrutura ✓

## Acceptance Criteria

- [ ] Dados de campanhas sincronizados a cada 1 hora
- [ ] Métricas armazenadas com granularidade diária
- [ ] Token renovado automaticamente sem erro
- [ ] Rate limits tratados com exponential backoff
- [ ] 99% de sucesso nas execuções de ações
- [ ] Log de auditoria completo para cada ação

## Dados Sincronizados

- **Campanhas:** id, name, status, objective, budget
- **Ad Sets:** id, name, status, budget, targeting
- **Ads:** id, name, status, creative_url
- **Métricas:** impressions, clicks, ctr, cpc, conversions, cpa, roas, spend
