# Epic 5: Motor de Regras Personalizadas

**Status:** 📋 Planejado
**Prioridade:** 🟠 Alta (Fase 2)
**Estimativa:** 2,5 semanas
**Owner:** @pm (Morgan)
**Dependências:** Epic 1, 2

---

## Visão Geral

Implementar motor de regras personalizadas que permite usuários criar automações com condições (SE) e ações (ENTÃO), avaliadas periodicamente.

## Objetivos

- ✅ CRUD de regras com builder visual
- ✅ Avaliação periódica de condições
- ✅ Dois modos: Sugestão (com aprovação) e Automático
- ✅ Histórico de execução
- ✅ Ativação/desativação dinâmica
- ✅ Análise de impacto estimado

## Stories Esperadas

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| 5.1 | Schema & model de regras | Baixa |
| 5.2 | UI para criar/editar regras | Média |
| 5.3 | Builder de condições (SE) | Alta |
| 5.4 | Builder de ações (ENTÃO) | Média |
| 5.5 | Engine de avaliação de regras | Alta |
| 5.6 | Agendador periódico (pg_cron) | Média |
| 5.7 | Sugestões vs. automático | Média |
| 5.8 | Histórico de execução | Baixa |
| 5.9 | Estimativa de impacto | Média |
| 5.10 | Testes & validação | Média |

## Dependências

- Epic 1: Infraestrutura ✓
- Epic 2: Meta API Sync ✓

## Acceptance Criteria

- [ ] Usuário consegue criar regra sem código
- [ ] Regras avaliadas em < 10 segundos para 100+ regras
- [ ] Modos Sugestão e Automático funcionam corretamente
- [ ] Histórico completo de execuções
- [ ] Estimativa de impacto precisa (±10%)
- [ ] UI intuitiva e responsiva
- [ ] Sem erros de lógica OR/AND

## Estrutura de Regra

```yaml
Nome: "Pausar campanhas sem conversão"
Escopo: "Campanha"
Frequência: "Diariamente"
Modo: "Sugestão" (ou "Automático")

Condições (SE):
  - Conversões < 1 AND
  - Últimos 3 dias AND
  - CPA > R$ 50

Ações (ENTÃO):
  - Pausar campanha
  - Enviar notificação e-mail
```

## Métricas Disponíveis (Operadores)

- **Operadores:** > | < | = | between | mudou mais que X%
- **Períodos:** 24h | 3d | 7d | 14d | mês atual
- **Combinadores:** AND | OR
