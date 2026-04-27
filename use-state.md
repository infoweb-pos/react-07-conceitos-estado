# Hook `useState` — Tutorial introdutório

[código-fonte](https://github.com/infoweb-pos/react-07-conceitos-estado/releases/tag/hook-useState)

## Objetivo

Demonstrar o uso do hook `useState` para gerenciar estado de componentes React, criando um formulário que:

1. Busca os dados de um post na API [DummyJSON](https://dummyjson.com) (`GET /posts/1`)
2. Permite editar os campos do post em um formulário controlado
3. Envia as alterações de volta para a API (`PUT /posts/1`)
4. Apaga o post da API (`DELETE /posts/1`)

**Tecnologias utilizadas:** Next.js · TypeScript · Tailwind CSS · shadcn/ui

---

## 1. O que é o `useState`?

O `useState` é um _hook_ do React que permite adicionar **estado** a um componente funcional. Antes dos hooks (React < 16.8), somente componentes de classe podiam ter estado. Com `useState` qualquer componente função pode ter suas próprias variáveis reativas.

### Sintaxe básica

```tsx
const [valor, setValor] = useState(valorInicial);
```

| Parte | Descrição |
|---|---|
| `valor` | Variável que guarda o estado atual |
| `setValor` | Função que atualiza o estado e dispara uma re-renderização |
| `valorInicial` | Valor usado na primeira renderização |

### Exemplo mínimo

```tsx
import { useState } from "react";

export default function Contador() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Cliques: {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
    </div>
  );
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
npx shadcn@latest add button card input label textarea
```

---

## 3. Estrutura de tipos

Crie o arquivo `src/types/post.ts` para tipar os dados vindos da API:

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
```

---

## 4. O componente `PostForm`

Crie o arquivo `src/components/PostForm.tsx`:

```tsx
// src/components/PostForm.tsx
"use client";

import { useState } from "react";
import { Post } from "@/types/post";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_URL = "https://dummyjson.com/posts/1";

export default function PostForm() {
  // ── Estado principal ────────────────────────────────────────────────────────
  const [post, setPost] = useState<Post | null>(null);       // dados do post
  const [loading, setLoading] = useState(false);             // indicador de carregamento
  const [status, setStatus] = useState<string | null>(null); // mensagem de retorno
  const [deleted, setDeleted] = useState(false);             // post foi apagado?

  // ── 4.1 Buscar dados (GET) ──────────────────────────────────────────────────
  async function handleFetch() {
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data: Post = await response.json();
      setPost(data);
      setDeleted(false);
    } catch (err) {
      setStatus(`Falha ao buscar: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  // ── 4.2 Atualizar dados (PUT) ───────────────────────────────────────────────
  async function handleUpdate() {
    if (!post) return;
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(API_URL, {
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

  // ── 4.3 Apagar dados (DELETE) ───────────────────────────────────────────────
  async function handleDelete() {
    if (!post) return;
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(API_URL, { method: "DELETE" });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      setPost(null);
      setDeleted(true);
      setStatus("Post apagado com sucesso!");
    } catch (err) {
      setStatus(`Falha ao apagar: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  // ── Renderização ────────────────────────────────────────────────────────────
  return (
    <Card className="w-full max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Gerenciar Post #1</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mensagem de status */}
        {status && (
          <p className="text-sm font-medium text-muted-foreground">{status}</p>
        )}

        {/* Post apagado */}
        {deleted && (
          <p className="text-sm text-destructive">
            O post foi apagado. Clique em "Buscar Dados" para carregar novamente.
          </p>
        )}

        {/* Formulário exibido somente quando há dados */}
        {post && !deleted && (
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

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>👤 Usuário: {post.userId}</p>
              <p>🏷️ Tags: {post.tags.join(", ")}</p>
              <p>👍 Likes: {post.reactions.likes} · 👎 Dislikes: {post.reactions.dislikes}</p>
              <p>👁️ Views: {post.views}</p>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        <Button onClick={handleFetch} disabled={loading} variant="outline">
          {loading ? "Carregando…" : "Buscar Dados"}
        </Button>

        {post && !deleted && (
          <>
            <Button onClick={handleUpdate} disabled={loading}>
              Atualizar
            </Button>
            <Button onClick={handleDelete} disabled={loading} variant="destructive">
              Apagar
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
```

---

## 5. A página principal

Edite (ou crie) o arquivo `src/app/page.tsx`:

```tsx
// src/app/page.tsx
import PostForm from "@/components/PostForm";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-background">
      <h1 className="text-2xl font-bold text-center mb-6">
        Tutorial useState — DummyJSON
      </h1>
      <PostForm />
    </main>
  );
}
```

---

## 6. Como executar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 7. Fluxo de estados passo a passo

```
Renderização inicial
  post = null  |  loading = false  |  status = null  |  deleted = false
        │
        ▼ clica em "Buscar Dados"
  loading = true
        │
        ▼ fetch GET /posts/1 concluído
  post = { id, title, body, … }  |  loading = false
        │
        ├── clica em "Atualizar"
        │     loading = true
        │     fetch PUT /posts/1
        │     post = dados atualizados  |  status = "Post atualizado com sucesso!"
        │     loading = false
        │
        └── clica em "Apagar"
              loading = true
              fetch DELETE /posts/1
              post = null  |  deleted = true  |  status = "Post apagado com sucesso!"
              loading = false
```

---

## 8. Conceitos demonstrados

| Conceito | Onde aparece no código |
|---|---|
| `useState` com tipo primitivo | `loading`, `deleted` |
| `useState` com tipo complexo | `post: Post \| null` |
| `useState` com `null` inicial | `post`, `status` |
| Atualização parcial de objeto | `setPost({ ...post, title: … })` |
| Estado derivado de outra variável | Exibição condicional do formulário |
| Efeito colateral assíncrono | Funções `handleFetch`, `handleUpdate`, `handleDelete` |

---

## 9. Referências

- [Documentação oficial — `useState`](https://react.dev/reference/react/useState)
- [DummyJSON — API de exemplo](https://dummyjson.com/docs/posts)
- [shadcn/ui — Componentes](https://ui.shadcn.com/docs/components)
- [Next.js — App Router](https://nextjs.org/docs/app)
