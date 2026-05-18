# Hooks `createContext` e `useContext` — Tutorial introdutório

## Objetivo

Demonstrar o uso dos hooks `createContext` e `useContext` para **compartilhar estado entre componentes** sem precisar passar props manualmente (_prop drilling_). O tutorial cria:

1. Uma página **Home** que busca a lista de posts em [`https://dummyjson.com/posts/`](https://dummyjson.com/posts/) e exibe cada item em um card.
2. Um **contexto** (`PostContext`) que armazena o `id` do post selecionado para edição.
3. Uma página **Edit** (`/edit`) que lê o `id` do contexto e carrega os dados do post para edição.

**Tecnologias utilizadas:** Next.js · TypeScript · Tailwind CSS · shadcn/ui

---

## 1. O que são `createContext` e `useContext`?

### `createContext`

Cria um **contexto** — um canal de dados que pode ser acessado por qualquer componente da árvore sem passar props intermediárias.

```tsx
const MeuContexto = createContext<TipoDoValor>(valorPadrão);
```

| Parte | Descrição |
|---|---|
| `MeuContexto.Provider` | Componente que fornece o valor a todos os filhos |
| `MeuContexto.Consumer` | Forma antiga de consumir; hoje substituído por `useContext` |
| `valorPadrão` | Usado quando o componente está **fora** de qualquer `Provider` |

### `useContext`

Lê o valor atual de um contexto dentro de um componente funcional.

```tsx
const valor = useContext(MeuContexto);
```

Sempre que o `Provider` atualizar o valor, todos os componentes que chamam `useContext(MeuContexto)` serão re-renderizados automaticamente.

### Exemplo mínimo

```tsx
import { createContext, useContext, useState } from "react";

// 1. Criar o contexto
const TemaContexto = createContext<"claro" | "escuro">("claro");

// 2. Prover o valor
function App() {
  const [tema, setTema] = useState<"claro" | "escuro">("claro");
  return (
    <TemaContexto.Provider value={tema}>
      <Botao />
      <button onClick={() => setTema(t => t === "claro" ? "escuro" : "claro")}>
        Alternar
      </button>
    </TemaContexto.Provider>
  );
}

// 3. Consumir o valor
function Botao() {
  const tema = useContext(TemaContexto);
  return <button className={tema === "escuro" ? "bg-black text-white" : "bg-white text-black"}>Clique</button>;
}
```

---

## 2. Pré-requisitos

### 2.1 Criar o projeto Next.js

```bash
npx create-next-app@latest meu-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd meu-app
```

### 2.2 Instalar e configurar o shadcn/ui

```bash
npx shadcn@latest init
```

Responda às perguntas do assistente (estilo padrão, prefixo de cor, etc.).

Em seguida, adicione os componentes necessários para este tutorial:

```bash
npx shadcn@latest add button card input label textarea badge
```

---

## 3. Estrutura de tipos

Crie o arquivo `src/types/post.ts`:

```ts
// src/types/post.ts

export type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
};

export type PostsResponse = {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
};
```

---

## 4. O contexto `PostContext`

Crie o arquivo `src/context/PostContext.tsx`. Aqui ficam:

- A **interface** do valor exposto pelo contexto.
- A criação do contexto com `createContext`.
- O **Provider** que gerencia o estado internamente com `useState`.
- Um hook customizado `usePostContext` para facilitar o consumo.

```tsx
// src/context/PostContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

// ── 1. Tipo do valor do contexto ────────────────────────────────────────────
type PostContextType = {
  selectedId: number | null;       // ID do post selecionado para edição
  selectPost: (id: number) => void; // seleciona um post
  clearPost: () => void;            // limpa a seleção
};

// ── 2. Criar o contexto com valor padrão ────────────────────────────────────
const PostContext = createContext<PostContextType>({
  selectedId: null,
  selectPost: () => {},
  clearPost: () => {},
});

// ── 3. Provider ─────────────────────────────────────────────────────────────
export function PostProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  function selectPost(id: number) {
    setSelectedId(id);
  }

  function clearPost() {
    setSelectedId(null);
  }

  return (
    <PostContext.Provider value={{ selectedId, selectPost, clearPost }}>
      {children}
    </PostContext.Provider>
  );
}

// ── 4. Hook customizado ─────────────────────────────────────────────────────
export function usePostContext() {
  return useContext(PostContext);
}
```

> **Boas práticas:**
> - Exporte o `Provider` e o hook customizado, mas **não** o contexto bruto.  
> - O hook customizado (`usePostContext`) evita importar `useContext` + `PostContext` em cada arquivo consumidor.

---

## 5. Registrar o Provider no layout raiz

Edite `src/app/layout.tsx` para envolver a aplicação com `PostProvider`:

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostProvider } from "@/context/PostContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tutorial useContext",
  description: "Demonstração de createContext e useContext",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <PostProvider>
          {children}
        </PostProvider>
      </body>
    </html>
  );
}
```

Agora **qualquer** página ou componente dentro da aplicação pode acessar o contexto.

---

## 6. O componente `PostList`

Crie o arquivo `src/components/PostList.tsx`. Este componente:

1. Busca a lista de posts na API com `useEffect`.
2. Chama `selectPost` do contexto quando o usuário clica em "Editar".
3. Redireciona para `/edit` usando o hook `useRouter` do Next.js.

```tsx
// src/components/PostList.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post, PostsResponse } from "@/types/post";
import { usePostContext } from "@/context/PostContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_URL = "https://dummyjson.com/posts?limit=10";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Consome o contexto ───────────────────────────────────────────────────
  const { selectPost } = usePostContext();
  const router = useRouter();

  // ── Busca os posts ao montar o componente ────────────────────────────────
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const data: PostsResponse = await response.json();
        setPosts(data.posts);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // ── Seleciona o post e navega para a página de edição ────────────────────
  function handleEdit(id: number) {
    selectPost(id);       // grava o ID no contexto
    router.push("/edit"); // navega para /edit
  }

  // ── Renderização ─────────────────────────────────────────────────────────
  if (loading) return <p className="text-center mt-10">Carregando posts…</p>;
  if (error)   return <p className="text-center mt-10 text-destructive">{error}</p>;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-base line-clamp-2">
                #{post.id} — {post.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.body}
              </p>
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                👍 {post.reactions.likes} · 👎 {post.reactions.dislikes} · 👁️ {post.views}
              </p>
            </CardContent>

            <CardFooter>
              <Button size="sm" onClick={() => handleEdit(post.id)}>
                Editar
              </Button>
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}
```

---

## 7. A página Home

Edite (ou crie) o arquivo `src/app/page.tsx`:

```tsx
// src/app/page.tsx
import PostList from "@/components/PostList";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-background">
      <h1 className="text-2xl font-bold text-center mb-6">
        Lista de Posts — Tutorial useContext
      </h1>
      <PostList />
    </main>
  );
}
```

---

## 8. O componente `PostEditForm`

Crie o arquivo `src/components/PostEditForm.tsx`. Este componente:

1. Lê o `selectedId` do contexto.
2. Busca os dados do post selecionado.
3. Permite editar título e conteúdo e enviar via `PUT`.

```tsx
// src/components/PostEditForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/types/post";
import { usePostContext } from "@/context/PostContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PostEditForm() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // ── Consome o contexto ───────────────────────────────────────────────────
  const { selectedId, clearPost } = usePostContext();
  const router = useRouter();

  // ── Busca o post pelo ID do contexto ─────────────────────────────────────
  useEffect(() => {
    if (!selectedId) return; // nada selecionado: não faz nada

    async function fetchPost() {
      setLoading(true);
      setStatus(null);
      try {
        const response = await fetch(`https://dummyjson.com/posts/${selectedId}`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const data: Post = await response.json();
        setPost(data);
      } catch (err) {
        setStatus(`Falha ao buscar: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [selectedId]); // re-executa sempre que o ID mudar no contexto

  // ── Enviar alterações (PUT) ───────────────────────────────────────────────
  async function handleUpdate() {
    if (!post) return;
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(`https://dummyjson.com/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: post.title, body: post.body }),
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const updated: Post = await response.json();
      setPost(updated);
      setStatus("Post atualizado com sucesso!");
    } catch (err) {
      setStatus(`Falha ao atualizar: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  // ── Voltar para a Home ────────────────────────────────────────────────────
  function handleBack() {
    clearPost();       // limpa o ID no contexto
    router.push("/"); // volta para a lista
  }

  // ── Nenhum post selecionado ───────────────────────────────────────────────
  if (!selectedId) {
    return (
      <div className="text-center mt-10 space-y-4">
        <p className="text-muted-foreground">Nenhum post selecionado.</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Voltar para a lista
        </Button>
      </div>
    );
  }

  // ── Renderização ──────────────────────────────────────────────────────────
  return (
    <Card className="w-full max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Editar Post #{selectedId}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {status && (
          <p className="text-sm font-medium text-muted-foreground">{status}</p>
        )}

        {loading && !post && (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        )}

        {post && (
          <>
            <div className="space-y-1">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="body">Conteúdo</Label>
              <Textarea
                id="body"
                rows={5}
                value={post.body}
                onChange={(e) => setPost({ ...post, body: e.target.value })}
              />
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>👤 Usuário: {post.userId}</p>
              <p>🏷️ Tags: {post.tags.join(", ")}</p>
              <p>👍 Likes: {post.reactions.likes} · 👎 Dislikes: {post.reactions.dislikes}</p>
              <p>👁️ Views: {post.views}</p>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={handleBack}>
          ← Voltar
        </Button>
        {post && (
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Salvando…" : "Salvar alterações"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

---

## 9. A página Edit

Crie o arquivo `src/app/edit/page.tsx`:

```tsx
// src/app/edit/page.tsx
import PostEditForm from "@/components/PostEditForm";

export default function EditPage() {
  return (
    <main className="min-h-screen p-8 bg-background">
      <h1 className="text-2xl font-bold text-center mb-6">
        Editar Post — Tutorial useContext
      </h1>
      <PostEditForm />
    </main>
  );
}
```

---

## 10. Estrutura final do projeto

```
src/
├── app/
│   ├── edit/
│   │   └── page.tsx          ← página de edição
│   ├── globals.css
│   ├── layout.tsx             ← registra o PostProvider
│   └── page.tsx               ← página home com a lista
├── components/
│   ├── PostEditForm.tsx        ← formulário de edição (consome o contexto)
│   ├── PostList.tsx            ← lista de posts (grava no contexto)
│   └── ui/                    ← componentes shadcn/ui
├── context/
│   └── PostContext.tsx         ← createContext + Provider + hook customizado
└── types/
    └── post.ts                 ← tipos TypeScript
```

---

## 11. Como executar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 12. Fluxo do contexto passo a passo

```
PostProvider (layout.tsx)
  selectedId = null
        │
        ▼ usuário clica "Editar" no PostList
  selectPost(id) → selectedId = <id escolhido>
  router.push("/edit")
        │
        ▼ página /edit renderiza PostEditForm
  useContext → lê selectedId
  useEffect → fetch GET /posts/<id>
  post = { id, title, body, … }
        │
        ├── usuário edita campos e clica "Salvar alterações"
        │     fetch PUT /posts/<id>
        │     post = dados atualizados
        │     status = "Post atualizado com sucesso!"
        │
        └── usuário clica "← Voltar"
              clearPost() → selectedId = null
              router.push("/")
```

---

## 13. Conceitos demonstrados

| Conceito | Onde aparece no código |
|---|---|
| `createContext` com tipo explícito | `PostContext.tsx` — `createContext<PostContextType>(…)` |
| `Provider` com estado interno | `PostProvider` usa `useState` para `selectedId` |
| `useContext` para consumir o contexto | `PostList` e `PostEditForm` via `usePostContext()` |
| Hook customizado sobre `useContext` | `usePostContext()` em `PostContext.tsx` |
| Re-renderização automática | `PostEditForm` re-executa o `useEffect` quando `selectedId` muda |
| Separação de responsabilidades | Contexto gerencia **quem** editar; componentes gerenciam **como** exibir |
| Navegação programática | `useRouter` + `selectPost` / `clearPost` coordenados |

---

## 14. Referências

- [Documentação oficial — `createContext`](https://react.dev/reference/react/createContext)
- [Documentação oficial — `useContext`](https://react.dev/reference/react/useContext)
- [DummyJSON — API de exemplo](https://dummyjson.com/docs/posts)
- [shadcn/ui — Componentes](https://ui.shadcn.com/docs/components)
- [Next.js — App Router](https://nextjs.org/docs/app)
