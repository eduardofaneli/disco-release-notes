# 🎯 Discord Release Notes Generator

Uma aplicação web moderna e leve para converter arquivos Markdown em mensagens formatadas para Discord, especialmente criada para release notes de projetos.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
[![GitHub](https://img.shields.io/badge/GitHub-eduardofaneli-black?logo=github)](https://github.com/eduardofaneli)
[![Discord](https://img.shields.io/badge/Discord-Join_Us-7289DA?logo=discord)](https://discord.gg/Hhp7TE5U)

## ✨ Funcionalidades

- 📝 **Editor Markdown Integrado**: Escreva seus release notes diretamente no navegador
- 📁 **Upload de Arquivos**: Carregue arquivos `.md` existentes
- 🎨 **Preview em Tempo Real**: Veja como ficará no Discord antes de enviar
- 📋 **Templates Prontos**: Templates pré-configurados para diferentes tipos de release
- 🎯 **Formatação Discord**: Conversão automática para formato Discord com embeds
- 💾 **Export JSON**: Baixe o resultado em formato JSON para uso posterior
- 💡 **Leve e Rápido**: Funciona 100% no navegador sem necessidade de backend

## 🚀 Tecnologias

- **Cliente**: React + TypeScript + Vite + Tailwind CSS

## 🔧 Configuração e Instalação

### Instalação do pnpm (se não estiver instalado)

```powershell
# Via npm
npm install -g pnpm

# Via Chocolatey (Windows)
choco install pnpm

# Via Scoop (Windows)
scoop install pnpm
```

### Setup do Projeto

1. **Clone o repositório**
```powershell
git clone https://github.com/eduardofaneli/disco-release-notes.git
cd disco-release-notes
```

2. **Instale as dependências**
```powershell
pnpm install
```

## 🏃‍♂️ Comandos Disponíveis

### Desenvolvimento
```powershell
# Iniciar em modo desenvolvimento
pnpm dev
```

### Build e Produção
```powershell
# Build completo
pnpm build

# Preview do build
pnpm preview
```

### Conversão de Arquivos
```powershell
# Converter arquivo manualmente
pnpm convert <arquivo-entrada.md> <arquivo-saida.json>
```

## 📝 Formatos de Release Notes Suportados

### 1. Formato Geral
```markdown
# 🚀 Título da Release

Descrição geral do release com informações importantes.

## ✨ Seção de Funcionalidades
- Item 1
- Item 2
- Item 3

## 🐛 Correções de Bugs
- Correção 1
- Correção 2
```

## 📁 Estrutura do Projeto

```
/
├── public/             # Arquivos estáticos
├── scripts/            # Scripts para automação
│   └── *.ps1           # Scripts PowerShell
├── src/                # Código fonte
│   ├── client/         # Frontend React
│   │   ├── components/ # Componentes React
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── styles/     # Estilos CSS
│   │   └── utils/      # Utilitários
│   │       └── converters/ # Conversores específicos
│   └── shared/         # Código compartilhado
│       ├── types.ts    # Interfaces TypeScript
│       └── converter.ts # Lógica de conversão base
├── templates/          # Templates de exemplo
├── .npmrc              # Configurações do pnpm
└── package.json        # Dependências e scripts
```

## 🔍 Troubleshooting

### Erro "command not found: pnpm"
```powershell
npm install -g pnpm
```

### Limpar completamente o projeto
```powershell
pnpm run clean
Remove-Item node_modules, pnpm-lock.yaml -Recurse -Force
pnpm install
```

### Problemas com dependências
```powershell
pnpm install --force
```

## 📦 Exportando para JSON

Depois de converter seu Markdown, você pode exportar o resultado para:

1. **Copy/Paste em Webhooks**: Copie o JSON e use-o diretamente com webhooks
2. **Download JSON**: Salve o arquivo JSON para uso posterior
3. **Envio Direto**: Envie diretamente para o Discord com seu webhook

## 📄 Licença

MIT
