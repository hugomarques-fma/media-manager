# Epic 6: Notificações, Auditoria & Relatórios

**Status:** 📋 Planejado
**Prioridade:** 🟡 Média (Fase 2-3)
**Estimativa:** 2 semanas
**Owner:** @pm (Morgan)
**Dependências:** Epic 1, 2, 4, 5

---

## Visão Geral

Implementar sistema de notificações in-app, alertas por e-mail, log de auditoria completo, relatórios automáticos e notas por campanha.

## Objetivos

- ✅ Centro de notificações in-app
- ✅ Alertas por e-mail (digest diário)
- ✅ Log de auditoria com before/after
- ✅ Relatórios automáticos em PDF
- ✅ Notas por campanha (colaboração)
- ✅ Histórico de ações executadas

## Stories Esperadas

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| 6.1 | Schema de notificações | Baixa |
| 6.2 | Centro de notificações in-app | Baixa |
| 6.3 | Badge & sino no header | Baixa |
| 6.4 | Email de alertas (Resend) | Média |
| 6.5 | Digest diário automático | Média |
| 6.6 | Configuração de limites de alerta | Baixa |
| 6.7 | Log de auditoria completo | Média |
| 6.8 | Visualização de antes/depois | Baixa |
| 6.9 | Geração de PDF de relatório | Média |
| 6.10 | Agendamento de relatórios | Média |
| 6.11 | Notas por campanha | Baixa |
| 6.12 | Histórico de notas | Baixa |

## Dependências

- Epic 1: Infraestrutura ✓
- Epic 2: Meta API Sync ✓
- Epic 4: Agente IA (notificações de sugestões)
- Epic 5: Regras (notificações de execução)

## Acceptance Criteria

- [ ] Notificações in-app aparecem em tempo real
- [ ] E-mail de digest enviado diariamente
- [ ] Log de auditoria completo (quem, quando, o quê, antes/depois)
- [ ] PDF de relatório formatado e legível
- [ ] Notas sincronizadas em tempo real
- [ ] Histórico completo sem perda de dados
- [ ] Sem duplicação de notificações

## Tipos de Notificações

| Tipo | Gatilho | Canal |
|------|---------|-------|
| Nova sugestão | Agente gera sugestão | In-app + Email |
| Sugestão aprovada | Usuário clica aprovado | In-app |
| Regra disparada | Condição atendida | In-app + Email |
| Orçamento esgotado | Budget daily atingido | In-app + Email |
| Erro de sincronização | Meta API falha | In-app + Email |
| Resumo diário | pg_cron nocturno | Email |

## Alertas Configuráveis

- Gasto diário acima de X
- CPA acima de Y
- ROAS abaixo de Z
- Taxa de clique muito baixa
- Conversões caindo

## Relatório PDF

- Período selecionável
- Campanhas selecionáveis
- Métricas principais
- Gráficos de evolução
- Sugestões do período
- Logo/branding customizável
