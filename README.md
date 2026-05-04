Bem-vindo ao projeto

https://cncshop-manutexcnc.github.io/cartao_digital/

www.cncshop.com.br

## Como rodar localmente

### Requisitos

- Node.js 20+ (recomendado)
- npm 10+ (ou compatível com seu Node)

### Passo a passo

1. Instale as dependências:

```bash
npm install
```

2. Inicie em modo desenvolvimento:

```bash
npm run dev
```

3. Acesse no navegador:

```text
http://localhost:8080
```

## Como testar localmente

### Rodar testes automatizados

```bash
npm run test
```

### Rodar testes em modo watch

```bash
npm run test:watch
```

### Validar build de produção

```bash
npm run build
```

### Validar lint

```bash
npm run lint
```

## Fonte dos dados no ambiente local

- O dashboard consome dados CSV publicados no Google Sheets.
- Mesmo rodando localmente, os dados continuam vindo das URLs definidas no codigo.
- Arquivo de referencia: `src/data/osData.ts`.

## Texto do Banner

O texto do banner (marquee rolante) fica em `src/pages/Index.tsx`, na variável `marqueeMessages`:

```typescript
const marqueeMessages = [
  "🎂 Parabéns aos funcionário aniversariantes do mes de Abril.",
  "🛡️ Segurança primeiro: confira a bancada, os cabos e os EPI antes de iniciar qualquer teste.",
  "📋 Laboratório organizado, equipe protegida e diagnóstico mais rápido.",
  "✨ Seu cuidado hoje evita retrabalho amanhã. Mantenha o padrão de excelência.",
  "⚡ Antes de energizar um equipamento, revise conexões, isolamento e aterramento.",
];
```

Para editar as mensagens do banner, simplesmente modifique os textos dentro dessa array. As mudanças aparecerão imediatamente ao salvar e recarregar o navegador.

## Guia Rápido de Versionamento

Este projeto usa Conventional Commits + Release Please para versionamento SemVer automatizado.

### Como funciona

1. Faça commits no padrão Conventional Commits.
2. O Release Please cria ou atualiza o PR de release na main.
3. O PR de release é mergeado e gera tag/release no GitHub.
4. O deploy publica o build com a versão atualizada no topo do sistema.

### Tipos de commit e impacto na versão

- fix: sobe Patch (exemplo: 1.0.0 -> 1.0.1)
- feat: sobe Minor (exemplo: 1.0.0 -> 1.1.0)
- feat! ou BREAKING CHANGE: sobe Major (exemplo: 1.0.0 -> 2.0.0)
- refactor: normalmente Patch
- chore, docs, test: normalmente sem impacto funcional direto

### Exemplos prontos

- fix: corrige exibicao da versao no header
- fix: ajusta intervalo de atualizacao para 2 minutos
- feat: adiciona filtro por status no dashboard
- refactor: simplifica logica de notificacoes
- chore: ajusta workflow de release

### Modelo recomendado

tipo(escopo): resumo curto

Exemplo:

fix(version): corrige leitura da versao no build

### Commits para evitar

- Evite mensagens vagas como: update, ajustes, melhorias, misc
- Evite usar feat quando for apenas correcao (prefira fix)
- Evite usar feat! sem necessidade (isso sobe Major)
- Evite misturar varios tipos de mudanca em um unico commit

### Boas praticas para nao gerar release inesperada

1. Use fix para bug e feat apenas para funcionalidade nova.
2. Separe mudancas tecnicas (chore/refactor) das funcionais.
3. Use BREAKING CHANGE somente quando houver quebra real de compatibilidade.
4. Revise o titulo do commit antes do push para main.

### Cenario -> commit recomendado

| Cenario | Commit recomendado | Impacto SemVer |
| --- | --- | --- |
| Corrigiu bug na tela ou regra de negocio | fix: corrige ... | Patch |
| Adicionou nova funcionalidade para usuario | feat: adiciona ... | Minor |
| Melhorou organizacao interna sem mudar comportamento | refactor: reorganiza ... | Patch |
| Ajustou pipeline, CI/CD, workflow ou build | chore: ajusta ... | Sem release funcional |
| Atualizou documentacao | docs: atualiza ... | Sem release funcional |
| Mudou contrato/API de forma incompativel | feat!: altera ... ou BREAKING CHANGE | Major |

### 5 exemplos reais (copiar e usar)

1. fix: ajusta intervalo de autoatualizacao para 2 minutos
2. fix: corrige exibicao da versao no topo do dashboard
3. feat: exibe versao dinamica do build no header
4. chore: automatiza merge de PRs do release-please
5. chore: ajusta deploy para injetar versao da release no build
