# GestorFinanceiro Pro

Sistema completo de gestão financeira pessoal construído com React, TypeScript, Vite e Supabase.

## 🚀 Funcionalidades

- ✅ Autenticação completa (Login, Registro, Recuperação de Senha)
- ✅ Dashboard com estatísticas e gráficos
- ✅ Gestão de Contas a Pagar
- ✅ Gestão de Entradas/Receitas
- ✅ Visualização Kanban
- ✅ Relatórios com exportação CSV e PDF
- ✅ Sistema de Notificações
- ✅ Tema Dark/Light
- ✅ Configurações de Perfil
- ✅ Menu Mobile Responsivo

## 🛠️ Tecnologias

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Database, RLS)
- **Build:** Vite
- **Deploy:** Vercel

## 📋 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🗄️ Estrutura do Banco de Dados (Supabase)

### Tabelas necessárias:

1. **accounts** - Contas a pagar
2. **incomes** - Entradas/Receitas
3. **profiles** - Perfis de usuário

### RLS (Row Level Security)

Todas as tabelas têm RLS habilitado para garantir que cada usuário só acesse seus próprios dados.

## 📱 Deploy na Vercel

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push

## 📄 Licença

MIT
