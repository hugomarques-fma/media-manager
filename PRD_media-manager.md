# media-manager
## Plataforma de Gestão Inteligente de Meta Ads

**Product Requirements Document (PRD)**
Versão 1.0 — MVP | Março de 2026

---

## Sumário

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Perfil de Usuários](#2-perfil-de-usuários)
3. [Funcionalidades Core do MVP](#3-funcionalidades-core-do-mvp)
4. [Dashboard Gerencial](#4-dashboard-gerencial)
5. [Funcionalidades Adicionais para o MVP](#5-funcionalidades-adicionais-para-o-mvp)
6. [Arquitetura Técnica](#6-arquitetura-técnica)
7. [Requisitos Não Funcionais](#7-requisitos-não-funcionais)
8. [Fora do Escopo do MVP](#8-fora-do-escopo-do-mvp)
9. [Roadmap Sugerido](#9-roadmap-sugerido)
10. [Métricas de Sucesso do Produto](#10-métricas-de-sucesso-do-produto)

---

## 1. Visão Geral do Produto

### 1.1 Resumo Executivo

**media-manager** é uma plataforma SaaS de gestão inteligente de campanhas de tráfego pago no Meta Ads (Facebook e Instagram). A solução combina um agente de Inteligência Artificial com um painel gerencial completo, permitindo que gestores de tráfego e donos de negócios monitorem, analisem e otimizem campanhas de forma eficiente — com total controle sobre as ações executadas na conta de anúncios.

A proposta central é simples: **o agente de IA observa, aprende, sugere e executa. Mas nunca age de forma autônoma sem aprovação humana.**

### 1.2 Problema que o Produto Resolve

Gestores de tráfego enfrentam diariamente os seguintes desafios:

- Volume elevado de campanhas para monitorar simultaneamente
- Tempo gasto em análises manuais e repetitivas
- Dificuldade em identificar padrões de desempenho e oportunidades de otimização em tempo real
- Falta de histórico centralizado de mudanças e seus impactos
- Ausência de alertas proativos para anomalias de gastos ou queda de performance

O media-manager resolve esses pontos ao centralizar a inteligência de análise e a execução de otimizações em um único ambiente, com segurança e rastreabilidade total.

### 1.3 Objetivos do MVP

| Objetivo | Critério de Sucesso |
|---|---|
| Integração com Meta Ads API | Leitura e escrita de dados de campanhas ativas em tempo real |
| Agente de IA funcional | Geração de sugestões acionáveis com base nas métricas das campanhas |
| Fluxo de aprovação | 100% das sugestões passam por aprovação manual antes de serem aplicadas |
| Dashboard gerencial completo | Visualização de KPIs, gráficos e filtros interativos |
| Regras manuais personalizadas | CRUD de regras com condições e ações configuráveis pelo usuário |
| Banco de dados Supabase | Persistência de campanhas, sugestões, logs e regras |

---

## 2. Perfil de Usuários

| Persona | Descrição | Necessidades Principais |
|---|---|---|
| Gestor de Tráfego | Profissional que gerencia múltiplas contas de anúncios para clientes | Agilidade na análise, alertas inteligentes, histórico de ações |
| Dono de Negócio | Empresário que cuida do próprio tráfego pago | Visão clara de resultados, interface simples, sem depender de terceiros |
| Analista de Marketing | Profissional focado em métricas e relatórios de performance | Exportação de dados, gráficos detalhados, comparativos históricos |

---

## 3. Funcionalidades Core do MVP

### 3.1 Integração com Meta Ads API

A integração é a fundação da plataforma. Toda a inteligência do agente e as visualizações do dashboard dependem da conexão estável e segura com a API do Meta.

#### 3.1.1 Autenticação e Conexão

- Fluxo OAuth 2.0 via Facebook Login para conexão da conta de anúncios
- Armazenamento seguro do access token no Supabase (criptografado)
- Suporte a múltiplas contas de anúncios por usuário (para gestores de clientes)
- Indicador visual de status de conexão (conectado / token expirado / erro)
- Renovação automática de token com alerta ao usuário quando necessário

#### 3.1.2 Sincronização de Dados

- Sincronização automática periódica (a cada 1 hora por padrão, configurável)
- Sincronização manual on-demand via botão "Atualizar Agora"
- Dados sincronizados: Campanhas, Conjuntos de Anúncios (Ad Sets), Anúncios (Ads)
- Métricas capturadas: Impressões, Cliques, CTR, CPC, CPM, CPA, ROAS, Gasto, Alcance, Frequência, Conversões
- Histórico de métricas armazenado no Supabase para análise temporal
- Log de sincronização com timestamp e status de cada execução

> **Decisão técnica:** Utilizar a versão mais recente estável da Meta Marketing API. Dados de métricas serão armazenados no Supabase com granularidade diária para viabilizar análises históricas sem dependência contínua da API.

---

### 3.2 Agente de IA — Gestor Inteligente de Campanhas

O agente de IA é o coração diferencial da plataforma. Ele atua como um gestor de tráfego sênior virtual: observa, analisa, identifica padrões e faz recomendações fundamentadas. **Toda ação sugerida pelo agente requer aprovação explícita do usuário antes de ser executada.**

#### 3.2.1 Análise de Campanhas

- Análise contínua de todas as campanhas ativas da conta
- Identificação automática de campanhas com desempenho abaixo da média histórica
- Detecção de anomalias: CPC muito alto, CTR em queda, orçamento esgotado prematuramente
- Análise de frequência para identificar fadiga de anúncio (frequência > limite configurável)
- Comparação de performance entre períodos (semana atual vs. semana anterior, etc.)
- Score de saúde de cada campanha (de 0 a 100) com justificativa

#### 3.2.2 Geração de Sugestões

O agente gera sugestões de otimização em linguagem natural, com justificativa técnica e impacto estimado. As categorias de sugestões incluem:

| Categoria | Exemplos de Sugestões |
|---|---|
| Orçamento | Aumentar orçamento diário em 20% para campanha X (ROAS acima de 4x); Pausar campanha Y com gasto elevado e zero conversões |
| Lances (Bids) | Reduzir lance máximo do Ad Set Z em 15% (CPC 40% acima da média) |
| Anúncios | Pausar anúncio com frequência acima de 5 e CTR inferior a 0,5% |
| Públicos | Expandir público do Ad Set A (alcance esgotado com alta frequência) |
| Agenda | Concentrar veiculação nos dias de maior conversão (quinta e sexta) |
| Criativo | Alertar que 3 anúncios ativos usam o mesmo criativo há mais de 14 dias |

#### 3.2.3 Fluxo de Aprovação de Sugestões

Este é o mecanismo de segurança central da plataforma. **Nenhuma ação é executada sem aprovação explícita do usuário.**

| Etapa | Status | Descrição |
|---|---|---|
| 1 | 🔵 Análise | Agente analisa métricas e gera sugestão com justificativa e impacto estimado |
| 2 | 🟡 Pendente | Sugestão exibida ao usuário com todos os detalhes — aguardando revisão |
| 3a | ✅ Aprovada | Usuário aprova a sugestão. A ação é enfileirada para execução imediata via API |
| 3b | ❌ Rejeitada | Usuário rejeita a sugestão. Feedback opcional é registrado para aprendizado do agente |
| 4 | ✅ Executada | Ação executada com sucesso via Meta API. Log completo armazenado no Supabase |
| 4b | 🔴 Falhou | Execução falhou (ex: erro de API). Usuário é notificado com detalhes do erro |

---

### 3.3 Motor de Regras Personalizadas

Além das sugestões do agente, o usuário pode definir suas próprias regras de automação. Cada regra é composta por condições **(SE)** e ações **(ENTÃO)**, e também passa pelo fluxo de aprovação antes de ser aplicada — a menos que o usuário opte por execução automática para regras específicas.

#### 3.3.1 Estrutura de uma Regra

| Campo | Descrição | Exemplos |
|---|---|---|
| Nome | Identificador amigável da regra | "Pausar campanhas sem conversão em 3 dias" |
| Escopo | Nível de aplicação da regra | Conta / Campanha / Ad Set / Anúncio |
| Condições (SE) | Conjunto de métricas e operadores | CPA > R$ 50 E Conversões < 1 nos últimos 3 dias |
| Ações (ENTÃO) | O que fazer quando as condições forem atendidas | Pausar campanha / Reduzir orçamento em X% |
| Frequência | Com que regularidade a regra será avaliada | A cada hora / Diariamente / Semanalmente |
| Modo de execução | Com ou sem aprovação manual | Sugestão (padrão) / Automático (avançado) |
| Status | Estado atual da regra | Ativa / Pausada / Arquivada |

#### 3.3.2 Condições Disponíveis (SE)

- **Métricas:** CPA, CPC, CPM, CTR, ROAS, Gasto Total, Impressões, Conversões, Frequência, Alcance, Taxa de Clique no Link
- **Operadores:** maior que, menor que, igual a, entre, mudou mais de X% em relação ao período anterior
- **Períodos:** últimas 24h, últimos 3 dias, últimos 7 dias, últimos 14 dias, mês atual
- **Combinadores:** E (AND) / OU (OR) entre condições

#### 3.3.3 Ações Disponíveis (ENTÃO)

- Pausar campanha / Ad Set / Anúncio
- Ativar campanha / Ad Set / Anúncio pausado
- Aumentar orçamento diário em X% (ou valor fixo)
- Reduzir orçamento diário em X% (ou valor fixo)
- Enviar notificação via e-mail ao usuário
- Enviar notificação via webhook (para integrações externas)

---

## 4. Dashboard Gerencial

O dashboard é o centro de comando da plataforma. Projetado para oferecer visibilidade instantânea do desempenho das campanhas, com filtros poderosos e visualizações interativas que facilitam a tomada de decisão rápida.

### 4.1 Filtros Globais do Dashboard

Todos os painéis e gráficos respondem aos filtros globais posicionados no topo da página:

| Filtro | Opções / Comportamento |
|---|---|
| Período | Hoje / Ontem / Últimos 7 dias / Últimos 14 dias / Últimos 30 dias / Mês atual / Mês anterior / Intervalo personalizado |
| Conta de Anúncios | Seleção de conta (para usuários com múltiplas contas) |
| Campanha | Todas ou seleção múltipla de campanhas específicas |
| Objetivo de Campanha | Tráfego / Conversão / Alcance / Engajamento / Geração de leads / etc. |
| Status | Todas / Ativas / Pausadas / Arquivadas |
| Comparação | Habilitar comparação com período anterior (delta % em cada métrica) |

### 4.2 Painéis e Visualizações

#### 4.2.1 Painel de KPIs — Visão Rápida

Cards de métricas principais no topo do dashboard, com delta de variação em relação ao período anterior:

| Gasto Total | Conversões | CPA Médio | ROAS Médio |
|---|---|---|---|
| R$ 12.450,00 | 847 | R$ 14,70 | 4,2x |
| +8,3% vs período ant. | +12,1% vs período ant. | -5,4% vs período ant. | +0,7x vs período ant. |

Cards adicionais: Impressões, Alcance, CTR Médio, CPC Médio, CPM Médio, Frequência Média, Cliques Totais.

#### 4.2.2 Gráfico de Evolução Temporal

- Gráfico de linhas mostrando evolução das principais métricas ao longo do período selecionado
- Eixo duplo: métricas de custo (CPA, CPC) no eixo esquerdo; volume (conversões, cliques) no eixo direito
- Seleção de quais métricas exibir (multi-select de até 4 métricas simultaneamente)
- Granularidade configurável: por dia, por semana, por mês
- Hover interativo mostrando valores exatos de cada ponto da linha
- Área sombreada opcional para destacar intervalo de comparação

#### 4.2.3 Tabela de Campanhas

- Listagem completa de campanhas com paginação e ordenação por qualquer coluna
- Colunas: Nome, Status, Objetivo, Gasto, Impressões, Cliques, CTR, CPC, Conversões, CPA, ROAS, Frequência, Score de Saúde
- Indicadores visuais de status (ícone colorido: verde = ativa, cinza = pausada)
- Score de saúde exibido como barra de progresso colorida (verde / amarelo / vermelho)
- Ação rápida: botão de Pausar/Ativar diretamente na tabela (com confirmação)
- Exportação para CSV e Excel

#### 4.2.4 Gráfico de Distribuição de Gastos

- Gráfico de pizza ou barras mostrando participação de cada campanha no gasto total
- Visão alternativa: distribuição por objetivo de campanha
- Destaque para campanhas com maior custo e menor performance

#### 4.2.5 Heatmap de Performance por Hora/Dia

- Mapa de calor mostrando horários e dias da semana com melhor desempenho
- Métrica selecionável: Conversões, CPA, CTR ou Cliques
- Ferramenta útil para configurar agendamentos de veiculação

#### 4.2.6 Painel de Anúncios

- Visualização em cards (grid) dos anúncios ativos com thumbnail do criativo
- Métricas por anúncio: Impressões, CTR, CPC, Frequência, Status
- Alerta visual para anúncios com fadiga (frequência elevada)
- Filtro por Ad Set e campanha

---

## 5. Funcionalidades Adicionais para o MVP

Funcionalidades complementares de baixa complexidade de implementação que agregam grande valor à experiência do usuário e aceleram a adoção da plataforma:

### 5.1 Central de Notificações e Alertas

Sistema simples de alertas baseado em eventos da plataforma, sem dependência de serviços externos complexos:

- Alertas in-app: sino de notificações no header com badge de contagem
- Tipos de alerta: nova sugestão do agente, regra disparada, orçamento diário atingido, campanha pausada automaticamente, erro de sincronização com a API
- Configuração de limites de alerta: gasto diário acima de X, CPA acima de Y, ROAS abaixo de Z
- E-mail de alerta diário (digest) com resumo das campanhas — usando Supabase Edge Functions + serviço de e-mail transacional simples como Resend
- Histórico de notificações com marcação de lidas/não lidas

> 🟢 **Complexidade baixa:** alertas in-app usam tabela de notificações no Supabase com polling simples ou Realtime. Digest por e-mail via Edge Function agendada (cron).

### 5.2 Histórico de Ações e Log de Auditoria

- Registro completo de todas as ações executadas na conta: quem aprovou, quando, qual foi a ação e em qual campanha
- Visualização de antes e depois para cada mudança (ex: orçamento de R$100 → R$120)
- Filtros por data, tipo de ação, campanha e usuário executante
- Exportação do log em CSV para auditoria externa

> 🟢 **Complexidade baixa:** uma tabela `action_logs` no Supabase com triggers automáticos a cada execução de sugestão ou regra.

### 5.3 Relatórios Automáticos

- Geração de relatório de performance em PDF com um clique
- Seleção de métricas, período e campanhas para incluir no relatório
- Relatório agendado semanal ou mensal enviado por e-mail em PDF
- Template de relatório formatado com logo e identidade visual customizável

> 🟢 **Complexidade baixa:** geração de PDF via biblioteca como Puppeteer ou html-pdf em Edge Function do Supabase. Sem necessidade de serviços de relatório terceiros.

### 5.4 Comparador de Períodos

- Módulo dedicado para comparar performance entre dois períodos customizáveis
- Tabela lado a lado com delta percentual de cada métrica
- Gráfico de barras comparativo visual
- Útil para análise de sazonalidade e impacto de mudanças realizadas

> 🟢 **Complexidade baixa:** apenas query dupla no Supabase (dados históricos) com cálculo de delta no frontend. Zero integração adicional.

### 5.5 Notas e Anotações por Campanha

- Cada campanha ou Ad Set pode ter notas de texto livre anexadas
- Campo de anotação visível na tabela de campanhas e no detalhe de cada campanha
- Útil para registrar contexto: "Campanha de lançamento do produto X", "Teste A/B de criativo"
- Histórico de notas com data e autor

> 🟢 **Complexidade mínima:** tabela `campaign_notes` no Supabase com relação à campanha e ao usuário.

### 5.6 Calculadora de Metas e ROI

- Ferramenta simples para calcular projeções de resultado
- Entradas: orçamento disponível, CPA meta, ROAS meta, taxa de conversão estimada
- Saída: projeção de conversões esperadas, faturamento estimado, lucro projetado
- Sem integração com API externa — cálculo puramente no frontend

> 🟢 **Complexidade mínima:** componente de UI com cálculos JavaScript puro. Pode ser lançado como funcionalidade de bônus na primeira versão.

### 5.7 Gerenciamento de Múltiplos Clientes (Agency View)

- Para gestores de tráfego que atendem múltiplos clientes
- Visão geral consolidada: gasto total por cliente, campanhas ativas, alertas pendentes
- Troca rápida de conta de anúncios com um clique
- Permissões por workspace: acesso à conta do cliente sem compartilhar dados entre clientes

> 🟡 **Complexidade média-baixa:** estrutura multi-tenant no Supabase com Row Level Security (RLS). Um usuário pode ter múltiplos workspaces/contas vinculadas.

---

## 6. Arquitetura Técnica

### 6.1 Stack Tecnológico Recomendado

| Camada | Tecnologia Sugerida | Justificativa |
|---|---|---|
| Frontend | Next.js + Tailwind CSS + shadcn/ui | Framework React SSR, componentes prontos, alta produtividade |
| Banco de Dados | Supabase (PostgreSQL) | Realtime, autenticação integrada, Row Level Security, Edge Functions |
| Autenticação | Supabase Auth + OAuth Meta | Auth nativo do Supabase + fluxo OAuth para Meta Ads API |
| Backend / API | Supabase Edge Functions (Deno) | Serverless, sem servidor para manter, integrado ao Supabase |
| Agente de IA | OpenAI GPT-4o / Claude API | Modelo de linguagem para análise de métricas e geração de sugestões |
| Meta Ads API | Meta Marketing API v21+ | Leitura e escrita de campanhas, ad sets e anúncios |
| Fila de Tarefas | Supabase pg_cron + Edge Functions | Agendamento de sincronizações e envio de relatórios |
| Gráficos | Recharts ou Chart.js | Bibliotecas React maduras, sem dependências externas de custo |
| E-mail Transacional | Resend | API simples, plano gratuito generoso, integra com Next.js facilmente |

### 6.2 Modelo de Dados Principal (Supabase)

| Tabela | Campos Principais | Finalidade |
|---|---|---|
| `users` | id, email, name, created_at | Usuários da plataforma (gerenciado pelo Supabase Auth) |
| `ad_accounts` | id, user_id, meta_account_id, name, access_token, status | Contas de anúncios vinculadas |
| `campaigns` | id, ad_account_id, meta_campaign_id, name, status, objective, daily_budget | Campanhas sincronizadas |
| `ad_sets` | id, campaign_id, meta_adset_id, name, status, budget | Conjuntos de anúncios |
| `ads` | id, ad_set_id, meta_ad_id, name, status, creative_url | Anúncios individuais |
| `campaign_metrics` | id, campaign_id, date, spend, impressions, clicks, ctr, cpc, conversions, cpa, roas | Histórico de métricas diárias |
| `ai_suggestions` | id, account_id, type, scope, description, reasoning, status, created_at, resolved_at | Sugestões geradas pelo agente |
| `rules` | id, user_id, name, scope, conditions (jsonb), actions (jsonb), frequency, mode, status | Regras personalizadas do usuário |
| `action_logs` | id, user_id, suggestion_id, rule_id, action_type, entity_id, before_state, after_state, executed_at, status | Log de auditoria de todas as ações |
| `notifications` | id, user_id, type, message, read, created_at | Central de notificações in-app |
| `campaign_notes` | id, campaign_id, user_id, content, created_at | Anotações por campanha |

### 6.3 Fluxo de Execução do Agente de IA

1. Edge Function agendada (pg_cron) dispara análise a cada hora
2. Busca dados de campanhas e métricas atualizadas no Supabase
3. Formata contexto estruturado (JSON) com métricas e histórico de cada campanha
4. Envia o contexto para o modelo de IA (OpenAI / Claude) via API com prompt especializado
5. Processa a resposta do modelo e persiste as sugestões na tabela `ai_suggestions`
6. Notifica o usuário in-app sobre novas sugestões pendentes
7. Usuário revisa e aprova/rejeita via interface
8. Execução via Meta Marketing API após aprovação
9. Resultado registrado na tabela `action_logs`

---

## 7. Requisitos Não Funcionais

| Categoria | Requisito |
|---|---|
| Segurança | Access tokens da Meta API armazenados criptografados (AES-256). Acesso a dados isolado por usuário via Row Level Security do Supabase |
| Performance | Dashboard carrega em até 3 segundos para contas com até 50 campanhas ativas. Sincronização em background não bloqueia a interface |
| Confiabilidade | Retry automático com backoff exponencial para chamadas à Meta API em caso de rate limit ou erro temporário |
| Escalabilidade | Supabase Edge Functions escalam automaticamente. Sem infraestrutura gerenciada manualmente no MVP |
| Usabilidade | Interface responsiva para desktop (prioridade) e mobile (visualização). Onboarding guiado de conexão da conta em menos de 5 minutos |
| Rastreabilidade | Toda ação executada na conta de anúncios registrada com timestamp, usuário e resultado. Impossível executar ação sem log |
| Disponibilidade | Dependência das janelas de manutenção do Supabase e da Meta API. SLA alvo: 99,5% (excluindo indisponibilidades de terceiros) |
| Privacidade | Dados de clientes isolados por workspace. Nenhum dado é compartilhado entre contas de usuários distintos |

---

## 8. Fora do Escopo do MVP

As funcionalidades abaixo são intencionalmente excluídas do MVP para manter o foco e a velocidade de desenvolvimento. Podem ser consideradas para versões futuras:

- Integração com outras plataformas de anúncios (Google Ads, TikTok Ads, LinkedIn Ads)
- Criação de campanhas diretamente pela plataforma (apenas gestão das existentes no MVP)
- Editor de criativos e geração de imagens/vídeos para anúncios
- Testes A/B gerenciados pela plataforma
- Previsão de orçamento e simulação de cenários avançada (ML)
- Integração nativa com CRMs (HubSpot, Salesforce, RD Station)
- Aplicativo mobile nativo (iOS / Android)
- Painel de colaboração em tempo real com múltiplos usuários simultâneos
- API pública da plataforma para integrações customizadas
- White-label para revenda do produto

---

## 9. Roadmap Sugerido

| Fase | Duração Estimada | Entregas Principais |
|---|---|---|
| **Fase 0** — Infraestrutura | Semanas 1–2 | Setup Supabase, autenticação, estrutura do projeto Next.js, conexão OAuth Meta |
| **Fase 1** — Core MVP | Semanas 3–6 | Sincronização de campanhas, dashboard básico com KPIs e tabela, agente de IA com primeiras sugestões, fluxo de aprovação |
| **Fase 2** — Completo | Semanas 7–10 | Motor de regras completo, todos os gráficos do dashboard, alertas e notificações, histórico de ações, relatório PDF |
| **Fase 3** — Polimento | Semanas 11–12 | Notas por campanha, calculadora de ROI, comparador de períodos, testes, documentação, onboarding do usuário |
| **Beta Fechado** | Semanas 13–14 | 5–10 usuários beta, coleta de feedback, correções prioritárias, ajuste fino do agente de IA |
| **Lançamento MVP** | Semana 15+ | Lançamento público, suporte ativo, monitoramento de métricas de produto |

---

## 10. Métricas de Sucesso do Produto

| Categoria | Métrica | Meta (3 meses pós-lançamento) |
|---|---|---|
| Adoção | Contas de anúncios conectadas | 50+ contas ativas |
| Engajamento | Taxa de aprovação de sugestões do agente | > 60% das sugestões aprovadas |
| Engajamento | Sessões semanais por usuário ativo | 3+ sessões/semana |
| Retenção | Retenção mensal de usuários pagantes | > 80% após 30 dias |
| Valor | Usuários que relatam redução de CPA | > 40% dos usuários ativos |
| Qualidade do Agente | Sugestões marcadas como úteis pelo usuário | > 70% de feedback positivo |
| Performance | Tempo de carregamento do dashboard | < 3 segundos (P95) |
| Confiabilidade | Taxa de sucesso de execução de ações aprovadas | > 99% |

---

*media-manager — PRD v1.0 | Documento de uso interno | Março 2026*
