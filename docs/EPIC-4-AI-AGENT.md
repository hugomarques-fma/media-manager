# Epic 4: Agente de IA & Sugestões

**Status:** 📋 Planejado
**Prioridade:** 🔴 Crítica (Fase 1-2)
**Estimativa:** 3 semanas
**Owner:** @pm (Morgan)
**Dependências:** Epic 1, 2

---

## Visão Geral

Implementar agente de IA que analisa campanhas, detecta anomalias e gera sugestões de otimização com fluxo de aprovação obrigatório.

## Objetivos

- ✅ Análise contínua de campanhas (horária via pg_cron)
- ✅ Detecção de anomalias (CPC alto, CTR queda, etc.)
- ✅ Geração de sugestões em linguagem natural
- ✅ Fluxo de aprovação (Análise → Pendente → Aprovada/Rejeitada → Executada)
- ✅ Score de saúde por campanha (0-100)
- ✅ Rastreamento de feedback

## Stories Esperadas

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| 4.1 | Setup de Edge Function para análise | Média |
| 4.2 | Integração com OpenAI/Claude API | Média |
| 4.3 | Prompt engineering para análise | Alta |
| 4.4 | Detecção de anomalias | Alta |
| 4.5 | Geração de sugestões estruturadas | Média |
| 4.6 | Score de saúde de campanha | Média |
| 4.7 | UI de sugestões pendentes | Média |
| 4.8 | Fluxo de aprovação/rejeição | Média |
| 4.9 | Execução de sugestões aprovadas | Alta |
| 4.10 | Feedback & learning do agente | Média |

## Dependências

- Epic 1: Infraestrutura ✓
- Epic 2: Meta API Sync ✓

## Acceptance Criteria

- [ ] Agente analisa campanhas 1x por hora
- [ ] Sugestões geradas em português claro
- [ ] 100% das sugestões passam por aprovação manual
- [ ] Score de saúde calculado corretamente
- [ ] Feedback registrado para aprendizado
- [ ] Nenhuma ação executada sem aprovação
- [ ] Análise completa em < 30 segundos

## Categorias de Sugestões

| Categoria | Exemplos |
|-----------|----------|
| **Orçamento** | Aumentar 20% (ROAS > 4x), pausar (zero conversões) |
| **Lances** | Reduzir 15% (CPC acima da média) |
| **Anúncios** | Pausar (frequência > 5, CTR < 0.5%) |
| **Públicos** | Expandir (alcance esgotado) |
| **Agenda** | Concentrar veiculação (quinta-sexta) |
| **Criativo** | Alertar fadiga (14+ dias, mesmo criativo) |

## Fluxo de Sugestões

```
Análise → Pendente → Aprovada/Rejeitada → Executada/Falhou
                     ↓
                 Log + Feedback
```
