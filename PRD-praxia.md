# PRD — PráxIA
### Gerador de Planos de Ação com IA
**Versão:** 1.1 — Escopo MVP revisado  
**Tipo de produto:** SaaS B2B — Especialistas  
**Modelo de entrega:** Web App  
**Status:** Em definição

---

## Visão do produto

Especialistas que vendem consultorias individuais (mentores, coaches, nutricionistas, consultores de negócios, etc.) gastam horas montando planos de ação personalizados para cada aluno. Esse trabalho segue uma lógica estruturada e poderia ser delegado — mas exige o conhecimento e o estilo do próprio especialista.

O **PráxIA** permite ao especialista cadastrar sua metodologia uma única vez e, a partir daí, gerar planos de ação individuais em minutos — com a qualidade, a linguagem e o raciocínio que o próprio especialista teria. O especialista importa os dados do aluno via planilha, ajusta seu prompt quando necessário, e recebe um PDF pronto para entregar.

---

## Problema central

- **Tempo gasto por plano:** Especialistas levam de 1 a 4h para montar um plano de ação decente. Isso limita a capacidade de atendimento.
- **Qualidade inconsistente:** Planos feitos com pressa ficam abaixo do padrão, impactando a percepção de valor do aluno e a retenção.
- **Trabalho repetitivo:** A estrutura do raciocínio é sempre a mesma. Só muda o contexto do aluno. Esse padrão é automatizável.
- **Gargalo de escala:** O especialista não consegue crescer sem contratar ou sacrificar a qualidade dos entregáveis.

---

## Personas

### Especialista (usuário primário)
Mentor, coach, nutricionista ou consultor que vende consultorias individuais. Passa mais tempo produzindo do que estrategizando. Quer entregar planos de alta qualidade sem travar sua agenda.

### Aluno / Mentorado (beneficiário final)
Recebe o dossiê gerado. Quer um plano claro, personalizado e com a voz do especialista. Precisa sentir que recebeu atenção individual real.

### Assistente / Equipe (usuário secundário — fora do MVP)
Pode operar a ferramenta no lugar do especialista para escalar ainda mais o atendimento com supervisão mínima.

---

## Fluxo principal de uso (MVP)

1. **Onboarding da metodologia**  
   Especialista cadastra sua base de conhecimento: pilares do método, critérios de diagnóstico, lógica de priorização e materiais de referência (documentos, textos). Essa base alimenta o RAG.

2. **Configuração do prompt do especialista**  
   Especialista escreve e salva um prompt de instrução que será injetado junto com o RAG na geração. Define tom, estrutura do dossiê, ênfases e restrições de conteúdo. Pode ser editado a qualquer momento.

3. **Importação de dados do aluno via planilha**  
   Especialista faz upload de uma planilha (CSV ou Excel) com os dados do aluno: perfil, objetivos, respostas a diagnósticos, contexto relevante. O sistema mapeia as colunas para os campos esperados.

4. **Geração do dossiê pela IA**  
   A engine cruza: (1) base de conhecimento via RAG, (2) prompt customizado do especialista, (3) dados do aluno. Gera o plano de ação estruturado como o especialista faria.

5. **Geração e armazenamento do PDF**  
   Sistema renderiza o dossiê como PDF formatado com a identidade do especialista e armazena no sistema. Especialista pode baixar ou excluir o arquivo quando quiser.

---

## Funcionalidades e escopo do MVP

| Funcionalidade | MVP | Descrição |
|---|---|---|
| Base de conhecimento (metodologia) | ✅ Must | Interface para cadastrar textos e documentos que formam a base do RAG do especialista. |
| Prompt customizável do especialista | ✅ Must | Campo de texto livre onde o especialista define instruções de geração: tom, estrutura, ênfases, restrições. Lido junto com o RAG em toda geração. |
| Importação de dados via planilha | ✅ Must | Upload de CSV ou Excel com dados do aluno. Sistema mapeia colunas e estrutura os dados como contexto para a geração. |
| Engine de geração (RAG + prompt + dados) | ✅ Must | Núcleo do produto. Combina os três inputs e gera o dossiê estruturado. |
| Geração de PDF formatado | ✅ Must | Renderização do dossiê em PDF com logo e identidade visual do especialista. Template único para todos os alunos. |
| Armazenamento e gestão de PDFs | ✅ Must | Lista de dossiês gerados com opção de download e exclusão. Sem histórico por aluno — lista simples de arquivos. |
| Autenticação do especialista | ✅ Must | Login seguro. Dados e metodologia isolados por conta. |
| Editor inline do dossiê | ❌ Fora | Edição direta do conteúdo gerado antes de exportar. Entra na v1.1. |
| Histórico por aluno | ❌ Fora | Linha do tempo de dossiês por aluno. Entra na v1.1. |
| Templates por tipo de aluno | ❌ Fora | Substituído por template único. Pode entrar na v1.2. |
| Portal do aluno | ❌ Fora | Fora do escopo do produto por ora. |
| Integrações externas | ❌ Fora | Notion, Google Docs, etc. Fora do escopo por ora. |
| Multiusuário / equipe | ❌ Fora | Entra na v1.2 ou plano de equipe. |

---

## Detalhe: prompt customizável do especialista

O especialista tem acesso a um editor de texto na configuração da conta. O prompt salvo é injetado como instrução de alto nível no momento da geração, junto com os chunks recuperados pelo RAG e os dados do aluno. O especialista pode atualizar esse prompt a qualquer momento — a próxima geração já usará a versão mais recente.

**Para que serve o prompt do especialista:**
- Definir a estrutura desejada do dossiê e seções obrigatórias
- Estabelecer tom de voz e nível de detalhamento
- Indicar o que nunca deve aparecer no output
- Passar instruções que não cabem bem na base de conhecimento

A interface deve deixar claro que esse campo é o "manual de estilo" da geração, com exemplos de como usá-lo bem para reduzir a fricção de onboarding.

---

## Detalhe: importação de dados via planilha

O sistema aceita upload de CSV ou Excel (.xlsx). Na primeira vez, o especialista mapeia quais colunas correspondem a quais campos (nome do aluno, objetivo principal, contexto, respostas, etc.). Esse mapeamento é salvo e reutilizado nos uploads seguintes.

**Comportamentos esperados:**
- Suporte a geração individual (uma linha = um aluno) no MVP. Geração em lote entra na v1.1.
- Colunas não mapeadas são ignoradas.
- Sistema alerta quando campos críticos estiverem vazios ou ausentes antes de iniciar a geração.
- Auto-detecção de colunas por nome sugerida (se a coluna se chamar "objetivo" ou "nome", o sistema sugere o mapeamento automaticamente).

---

## Arquitetura funcional (MVP)

| Camada | Descrição |
|---|---|
| Base de conhecimento (RAG) | Documentos e textos do especialista indexados em vector store (pgvector no Supabase). Recuperados por similaridade semântica no momento da geração. |
| Prompt do especialista | Texto livre salvo na conta. Injetado como instrução de alto nível em toda geração. |
| Parser de planilha | Lê CSV/Excel (SheetJS), aplica mapeamento de colunas salvo pelo especialista, estrutura os dados do aluno como contexto. |
| Engine de geração | Combina chunks do RAG + prompt do especialista + dados do aluno. Chama LLM (Claude via Vercel AI SDK) e retorna dossiê estruturado. |
| Gerador de PDF | Renderiza o output da IA em PDF formatado (@react-pdf/renderer). Template único com suporte à identidade visual do especialista. |
| Armazenamento de PDFs | Arquivos gerados salvos no Supabase Storage com referência na conta do especialista. Interface lista, permite download e exclusão. |

---

## Stack de desenvolvimento

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend + Backend | Next.js 14+ (App Router) | Full-stack num único repositório. Server Actions substituem API separada no MVP. |
| UI | React + Tailwind CSS + shadcn/ui | shadcn/ui entrega componentes prontos (form, table, dialog, toast) — código fica no projeto, editável. |
| Banco de dados | Supabase (Postgres + Auth + Storage) | Postgres pra dados, Auth pra login, Storage pra PDFs. |
| Vector store | pgvector no Supabase | Evita serviço externo. Embeddings e metodologia no mesmo banco. |
| IA / LLM | Claude (Anthropic SDK) + Vercel AI SDK | Vercel AI SDK simplifica streaming e gerenciamento de contexto com Next.js. |
| Processamento de planilha | SheetJS (xlsx) | Parse de CSV e Excel no servidor, via Server Action. |
| Geração de PDF | @react-pdf/renderer | Gera PDF no servidor com componentes React. |
| Deploy | Vercel (plano Pro) | Timeout de 60s necessário para geração do dossiê. Plano gratuito limita a 10s. |
| Versionamento | GitHub | Integração nativa com Vercel para preview deployments. |

### Alerta: timeout no Vercel
A geração de um dossiê (RAG + prompt + LLM) vai ultrapassar 10s com frequência. Iniciar já no **Vercel Pro** (~$20/mês) para evitar reescrita de arquitetura. Alternativa futura: background jobs com Supabase Edge Functions ou Inngest para processar geração de forma assíncrona.

---

## Métricas de sucesso

| Métrica | Meta |
|---|---|
| Tempo do upload à entrega do PDF | < 15 minutos |
| Gerações sem necessidade de reconfigurar prompt | > 60% |
| NPS do especialista (30/60/90 dias) | > 50 |
| Retenção mensal de especialistas ativos | > 85% |

---

## Riscos e mitigações

| Risco | Nível | Mitigação |
|---|---|---|
| Geração genérica demais | Alto | Onboarding da metodologia exige exemplos de referência. Prompt do especialista adiciona controle fino sobre o output. |
| Prompt mal configurado degradando o output | Alto | Fornecer exemplos de prompts eficazes na interface. Indicar boas práticas diretamente no campo de edição. |
| Planilha com estrutura incompatível | Médio | Interface de mapeamento de colunas flexível. Validação antes da geração com alertas claros sobre campos ausentes. |
| Custo de API de IA | Médio | Modelagem de custo por dossiê desde o início. Limites por plano para controlar consumo. |
| Segurança de dados dos alunos | Médio | Dados da planilha tratados como sensíveis. Conformidade LGPD. Não armazenar dados do aluno além do necessário para a geração. |
| Fricção no onboarding da metodologia | Médio | Wizard guiado com perguntas estruturadas e opção de importar documentos existentes. |

---

## Modelo de negócio sugerido

| Plano | Descrição |
|---|---|
| Starter | Até 10 dossiês/mês. 1 base de conhecimento. Ideal para validar o produto com os primeiros especialistas. |
| Pro | Dossiês ilimitados. Múltiplas bases de conhecimento (para especialistas com mais de um programa). Personalização de marca no PDF. |
| Equipe | Múltiplos usuários com permissões controladas. Para especialistas que possuem assistentes operando o sistema. |

---

## Próximos passos

- [ ] Definir schema do banco de dados (tabelas: `specialists`, `knowledge_bases`, `documents`, `dossiers`)
- [ ] Definir estrutura de embeddings e estratégia de chunking dos documentos
- [ ] Definir template do PDF (seções, layout, campos de identidade visual)
- [ ] Criar repositório GitHub e configurar projeto Next.js
- [ ] Configurar projeto Supabase com pgvector habilitado
- [ ] Implementar autenticação com Supabase Auth
- [ ] Implementar onboarding da metodologia (upload de documentos + geração de embeddings)
- [ ] Implementar editor de prompt do especialista
- [ ] Implementar parser de planilha com mapeamento de colunas
- [ ] Implementar engine de geração (RAG + prompt + dados do aluno)
- [ ] Implementar geração e armazenamento do PDF
- [ ] Implementar listagem de dossiês com download e exclusão
