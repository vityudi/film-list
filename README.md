# 🎬 FilmList - App de Filmes Favoritos

Uma aplicação web moderna para descobrir, navegar e salvar seus filmes favoritos. Construída com Next.js, React e integrada com TMDB API e Supabase.

## 🎯 Decisões de Design

### 1. Arquitetura em Camadas

```
UI Components → Custom Hooks → Services → APIs/Database
```

- **Componentes**: Apresentação apenas
- **Hooks**: Lógica de estado e efeitos
- **Services**: Chamadas de API e operações de banco de dados
- **APIs**: Integrações externas

### 2. Gerenciamento de Estado

**Zustand** para gerenciar:
- Estado de autenticação
- Lista de favoritos
- Notificações

**Por quê?**
- Simples e leve (sem boilerplate)
- Sem provider hell
- Performance otimizada

### 3. Autenticação

**Supabase Auth** com:
- Sessions automáticas (JWT)
- Row Level Security no banco de dados
- Verificação de autenticação por rota

### 4. Persistência de Dados

Favoritos são salvos com:
- **Otimismo**: Atualiza UI imediatamente
- **Rollback**: Desfaz mudanças se falhar
- **Notificações**: Informa sucesso/erro ao usuário

### 5. Interface

Design inspirado em Netflix:
- Tema escuro para reduzir fadiga ocular
- Carrosséis horizontais para descoberta
- Cards com hover effects
- Grid responsivo

## 📊 Fluxo de Desenvolvimento

### 1️⃣ Setup Inicial
- Dependências: axios, Supabase, Zustand
- Configuração de ambiente
- TypeScript types

### 2️⃣ Integração de APIs
- TMDB Client com métodos de busca
- Supabase Client

### 3️⃣ Gerenciamento de Estado
- Zustand stores para auth e favoritos

### 4️⃣ Autenticação
- Auth service (sign up, login, logout)
- useAuth hook

### 5️⃣ Componentes UI
- Header, MovieCard, MovieRow
- Auth Forms

### 6️⃣ Funcionalidades
- Browse page
- Search
- Favorites page
- Add/Remove favoritos

### 7️⃣ Banco de Dados
- Schema SQL
- Row Level Security
- Triggers

### 8️⃣ Notificações
- Toast system

## 🎬 Funcionalidades Implementadas

### Landing Page (`/`)
- Apresentação com features
- Login/Signup inline
- Auto-redirect se autenticado

### Browse Page (`/browse`)
- 3 seções: Popular, Top Rated, Upcoming
- Busca em tempo real
- Carrosséis com scroll
- Adicionar/remover favoritos
- Clique em qualquer filme para ver detalhes completos

### Movie Details Modal
- Exibe informações completas do filme:
- Pôster e backdrop de alta qualidade
- Título e tagline
- Avaliação e número de votos
- Duração
- Data de lançamento
- Sinopse completa
- Lista de gêneros
- Orçamento e receita
- Status de lançamento
- Link para IMDb
- Adicionar/remover de favoritos diretamente do modal
- Suporte a navegação por teclado (ESC para fechar)
- Scroll bloqueado quando modal está aberto

### Favorites Page (`/favorites`)
- Exibição de todos os favoritos
- Grid responsivo
- Remover favoritos
- Botão "Share Favorites" no header para gerar link público

### Share Favorites
- Gerar links públicos para compartilhar lista de favoritos
- Link copiado automaticamente para clipboard
- Qualquer pessoa pode acessar o link sem fazer login
- Visualizar filmes compartilhados com clique para ver detalhes
- URL pública: `/share/[token-único]`

### Header
- Logo do app
- Busca integrada
- Menu de usuário
- Botão "Share Favorites" com eye icon azul
- Visível em todas as páginas autenticadas
- Texto em tempo real e feedback visual

### Autenticação
- Signup com validação
- Login simples
- Session persistente

### Notificações
- Toast success/error/info
- Auto-dismiss em 3s
- Feedback ao compartilhar (sucesso/erro)


## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- Uma conta no [TMDB](https://www.themoviedb.org/)
- Uma conta no [Supabase](https://supabase.com/)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/film-list.git
cd film-list
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais.

## ⚙️ Configuração

### Configurar TMDB API

1. Acesse [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Crie uma conta ou faça login
3. Vá para a seção de API
4. Copie sua **API Key** (v3 auth)
5. Cole em `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=sua_chave_api_aqui
```

### Configurar Supabase

#### 1. Criar Projeto Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em "New Project"
3. Preencha os detalhes:
   - **Name**: film-list
   - **Database Password**: Guarde com segurança
   - **Region**: Escolha a mais próxima

#### 2. Obter Credenciais

1. Vá para **Project Settings > API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Secret** → `SUPABASE_SERVICE_ROLE_KEY`

#### 3. Criar Banco de Dados

1. Vá para **SQL Editor**
2. Clique em "New Query"
3. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Clique em "Run"

Isso criará:
- Tabela `users` - Armazena dados dos usuários
- Tabela `favorites` - Armazena filmes favoritos
- Políticas de Row Level Security
- Gatilhos para criar registros de usuário automaticamente

#### 4. Habilitar Autenticação

1. Vá para **Authentication > Providers**
2. Certifique-se de que "Email" está habilitado

## 💻 Como Usar

### Modo Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

### Construir para Produção

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## 📁 Estrutura do Projeto

```
film-list/
├── app/                          # Next.js App Directory
│   ├── page.tsx                 # Landing page com login/signup
│   ├── layout.tsx               # Root layout com Toast
│   ├── globals.css              # Estilos globais
│   ├── browse/                  # Página de navegação
│   │   └── page.tsx            # Browse e search de filmes
│   ├── favorites/               # Página de favoritos
│   │   └── page.tsx            # Lista de filmes favoritos
│   └── favicon.ico             # Ícone
│
├── components/                   # Componentes React reutilizáveis
│   ├── Header.tsx              # Barra de navegação com menu e share button
│   ├── MovieCard.tsx           # Card individual de filme
│   ├── MovieRow.tsx            # Carrossel de filmes
│   ├── MovieDetailsModal.tsx   # Modal com detalhes completos do filme
│   ├── ShareButton.tsx         # Botão de compartilhamento de favoritos
│   ├── Toast.tsx               # Notificações toast
│   └── auth/
│       ├── LoginForm.tsx       # Formulário de login
│       └── SignUpForm.tsx      # Formulário de registro
│
├── lib/
│   ├── services/               # Clientes e serviços de API
│   │   ├── tmdbClient.ts      # Cliente da API TMDB
│   │   ├── supabaseClient.ts  # Cliente Supabase
│   │   ├── authService.ts     # Funções de autenticação
│   │   ├── favoritesService.ts # Operações de favoritos
│   │   └── shareService.ts    # Operações de compartilhamento
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts         # Gerenciamento de autenticação
│   │   ├── useFavorites.ts    # Gerenciamento de favoritos
│   │   └── useMovies.ts       # Busca, fetch e detalhes de filmes
│   │
│   ├── types/                  # Definições de tipos TypeScript
│   │   └── index.ts           # Types de Movie, User, etc
│   │
│   └── utils/                  # Utilidades
│       ├── store.ts           # Zustand stores (auth, favorites)
│       └── notificationStore.ts # Store de notificações
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Schema do banco de dados
│
├── public/                      # Arquivos estáticos
├── .env.example                 # Template de variáveis de ambiente
├── .env.local                   # Variáveis de ambiente (não versionar)
├── next.config.ts              # Configuração Next.js
├── tsconfig.json               # Configuração TypeScript
├── package.json                # Dependências e scripts
└── README.md                   # Este arquivo
```