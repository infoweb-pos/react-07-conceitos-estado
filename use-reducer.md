# Hook `useReducer` — Tutorial introdutório

> Continuação direta do tutorial [`use-context.md`](./use-context.md).

## Sumário

1. [Objetivo](#objetivo)
2. [Por que usar `useReducer` aqui?](#1-por-que-usar-usereducer-aqui)
3. [Pré-requisitos](#2-pré-requisitos)
4. [Modelo de dados](#3-modelo-de-dados)
5. [Estado global com reducer](#4-estado-global-com-reducer)
6. [Provider no layout](#5-provider-no-layout)
7. [Página Home com lista de posts](#6-página-home-com-lista-de-posts)
8. [Página de edição por ID (retrieve, update, delete)](#7-página-de-edição-por-id-retrieve-update-delete)
9. [Estrutura final](#8-estrutura-final)
10. [Fluxo completo de estado](#9-fluxo-completo-de-estado)
11. [Conceitos demonstrados](#10-conceitos-demonstrados)
12. [Referências](#11-referências)

## Objetivo

Demonstrar o uso do hook `useReducer` para centralizar o estado da aplicação React em um cenário com duas páginas:

1. **Home (`/`)**: busca e exibe posts da API [`https://dummyjson.com/posts/`](https://dummyjson.com/posts/).
2. **Edit (`/edit`)**: recebe/usa o `id` do post selecionado para **retrieve**, **update** e **delete**.

**Tecnologias utilizadas:** Next.js · TypeScript · Tailwind CSS · chadcnui (shadcn/ui)

---

## 1. Por que usar `useReducer` aqui?

No `useState`, cada pedaço de estado costuma ficar separado.  
Neste fluxo (lista + seleção + carregamento + edição + status), o estado cresce e as transições ficam mais claras com `useReducer`.

Com `useReducer` você organiza:

- **Estado único** (`state`)
- **Eventos explícitos** (`actions`)
- **Regras de transição** (`reducer`)

---

## 2. Pré-requisitos

Use a mesma base dos tutoriais anteriores (`use-state.md` e `use-context.md`):

```bash
npx create-next-app@latest meu-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd meu-app
npx shadcn@latest init
npx shadcn@latest add button card input label textarea badge
```

---

## 3. Modelo de dados

Crie `src/types/post.ts`:

```ts
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

## 4. Estado global com reducer

Crie `src/context/PostReducerContext.tsx`:

```tsx
"use client";

import { createContext, useContext, useReducer } from "react";
import { Post } from "@/types/post";

type PostState = {
  posts: Post[];
  selectedId: number | null;
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  status: string | null;
};

type PostAction =
  | { type: "LIST_LOADING" }
  | { type: "LIST_SUCCESS"; payload: Post[] }
  | { type: "LIST_ERROR"; payload: string }
  | { type: "SELECT_POST"; payload: number }
  | { type: "DETAIL_LOADING" }
  | { type: "DETAIL_SUCCESS"; payload: Post }
  | { type: "DETAIL_ERROR"; payload: string }
  | { type: "UPDATE_SUCCESS"; payload: Post }
  | { type: "DELETE_SUCCESS" }
  | { type: "CLEAR_STATUS" };

const initialState: PostState = {
  posts: [],
  selectedId: null,
  currentPost: null,
  loading: false,
  error: null,
  status: null,
};

function postReducer(state: PostState, action: PostAction): PostState {
  switch (action.type) {
    case "LIST_LOADING":
    case "DETAIL_LOADING":
      return { ...state, loading: true, error: null, status: null };
    case "LIST_SUCCESS":
      return { ...state, loading: false, posts: action.payload };
    case "LIST_ERROR":
    case "DETAIL_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SELECT_POST":
      return { ...state, selectedId: action.payload };
    case "DETAIL_SUCCESS":
      return { ...state, loading: false, currentPost: action.payload };
    case "UPDATE_SUCCESS":
      return {
        ...state,
        loading: false,
        currentPost: action.payload,
        status: "Post atualizado com sucesso!",
      };
    case "DELETE_SUCCESS":
      return {
        ...state,
        loading: false,
        currentPost: null,
        status: "Post removido com sucesso!",
      };
    case "CLEAR_STATUS":
      return { ...state, status: null };
    default:
      return state;
  }
}

type PostReducerContextType = {
  state: PostState;
  dispatch: React.Dispatch<PostAction>;
};

const PostReducerContext = createContext<PostReducerContextType | null>(null);

export function PostReducerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(postReducer, initialState);
  return (
    <PostReducerContext.Provider value={{ state, dispatch }}>
      {children}
    </PostReducerContext.Provider>
  );
}

export function usePostReducer() {
  const context = useContext(PostReducerContext);
  if (!context) throw new Error("usePostReducer deve ser usado dentro de PostReducerProvider");
  return context;
}
```

---

## 5. Provider no layout

No `src/app/layout.tsx`, envolva a aplicação com o provider:

```tsx
import { PostReducerProvider } from "@/context/PostReducerContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <PostReducerProvider>{children}</PostReducerProvider>
      </body>
    </html>
  );
}
```

---

## 6. Página Home com lista de posts

Crie `src/components/PostListReducer.tsx` e use na Home:

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostsResponse } from "@/types/post";
import { usePostReducer } from "@/context/PostReducerContext";

export default function PostListReducer() {
  const { state, dispatch } = usePostReducer();
  const router = useRouter();

  useEffect(() => {
    async function loadPosts() {
      dispatch({ type: "LIST_LOADING" });
      try {
        const response = await fetch("https://dummyjson.com/posts?limit=10");
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const data: PostsResponse = await response.json();
        dispatch({ type: "LIST_SUCCESS", payload: data.posts });
      } catch (err) {
        dispatch({ type: "LIST_ERROR", payload: (err as Error).message });
      }
    }
    loadPosts();
  }, [dispatch]);

  function handleEdit(id: number) {
    dispatch({ type: "SELECT_POST", payload: id });
    router.push("/edit");
  }

  return (
    <ul>
      {state.posts.map((post) => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <button onClick={() => handleEdit(post.id)}>Editar</button>
        </li>
      ))}
    </ul>
  );
}
```

`src/app/page.tsx`:

```tsx
import PostListReducer from "@/components/PostListReducer";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Lista de Posts — useReducer</h1>
      <PostListReducer />
    </main>
  );
}
```

---

## 7. Página de edição por ID (retrieve, update, delete)

Crie `src/components/PostEditReducerForm.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePostReducer } from "@/context/PostReducerContext";
import { Post } from "@/types/post";

export default function PostEditReducerForm() {
  const { state, dispatch } = usePostReducer();
  const router = useRouter();

  useEffect(() => {
    async function loadPost() {
      if (!state.selectedId) return;
      dispatch({ type: "DETAIL_LOADING" });
      try {
        const response = await fetch(`https://dummyjson.com/posts/${state.selectedId}`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const data: Post = await response.json();
        dispatch({ type: "DETAIL_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "DETAIL_ERROR", payload: (err as Error).message });
      }
    }
    loadPost();
  }, [state.selectedId, dispatch]);

  async function handleUpdate() {
    if (!state.currentPost) return;
    dispatch({ type: "DETAIL_LOADING" });
    const response = await fetch(`https://dummyjson.com/posts/${state.currentPost.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: state.currentPost.title,
        body: state.currentPost.body,
      }),
    });
    const updated: Post = await response.json();
    dispatch({ type: "UPDATE_SUCCESS", payload: updated });
  }

  async function handleDelete() {
    if (!state.currentPost) return;
    dispatch({ type: "DETAIL_LOADING" });
    await fetch(`https://dummyjson.com/posts/${state.currentPost.id}`, { method: "DELETE" });
    dispatch({ type: "DELETE_SUCCESS" });
    router.push("/");
  }

  if (!state.selectedId) return <p>Nenhum post selecionado.</p>;
  if (!state.currentPost) return <p>Carregando post...</p>;

  return (
    <div>
      <h2>Editar Post #{state.currentPost.id}</h2>
      <input
        value={state.currentPost.title}
        onChange={(e) =>
          dispatch({
            type: "DETAIL_SUCCESS",
            payload: { ...state.currentPost!, title: e.target.value },
          })
        }
      />
      <textarea
        value={state.currentPost.body}
        onChange={(e) =>
          dispatch({
            type: "DETAIL_SUCCESS",
            payload: { ...state.currentPost!, body: e.target.value },
          })
        }
      />
      <button onClick={handleUpdate}>Salvar (update)</button>
      <button onClick={handleDelete}>Apagar (delete)</button>
    </div>
  );
}
```

Crie `src/app/edit/page.tsx`:

```tsx
import PostEditReducerForm from "@/components/PostEditReducerForm";

export default function EditPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Edição de Post — useReducer</h1>
      <PostEditReducerForm />
    </main>
  );
}
```

---

## 8. Estrutura final

```txt
src/
├── app/
│   ├── edit/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── PostEditReducerForm.tsx
│   └── PostListReducer.tsx
├── context/
│   └── PostReducerContext.tsx
└── types/
    └── post.ts
```

---

## 9. Fluxo completo de estado

1. Home carrega lista (`LIST_LOADING` → `LIST_SUCCESS`).
2. Usuário clica em **Editar** (`SELECT_POST`) e navega para `/edit`.
3. Página de edição faz retrieve (`DETAIL_LOADING` → `DETAIL_SUCCESS`).
4. Usuário salva alterações (`UPDATE_SUCCESS`) ou remove (`DELETE_SUCCESS`).

---

## 10. Conceitos demonstrados

| Conceito | Aplicação |
|---|---|
| `useReducer` | Estado central com ações explícitas |
| Context + reducer | Compartilhamento de estado entre Home e Edit |
| Seleção por ID | Navegação de lista para edição |
| CRUD parcial | `retrieve`, `update`, `delete` no post selecionado |
| TypeScript | Tipagem de estado, ações e payloads |

---

## 11. Referências

- [React — `useReducer`](https://react.dev/reference/react/useReducer)
- [DummyJSON — posts](https://dummyjson.com/docs/posts)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/docs/components)
