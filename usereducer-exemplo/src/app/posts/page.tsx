"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "@/types/post";
import { api } from "@/services/api";

type PostFormState = {
  title: string;
  body: string;
  tags: string;
};

type DeletePostResponse = {
  id: number;
  title: string;
  isDeleted: boolean;
  deletedOn?: string;
};

const API_BASE_URL = "https://dummyjson.com/posts";

export default function EditPostPage() {
  const [postId, setPostId] = useState<string>("1");
  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostFormState>({
    title: "",
    body: "",
    tags: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void handleLoadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toPositiveId(value: string): number | null {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  }

  function mapPostToFormState(nextPost: Post): PostFormState {
    return {
      title: nextPost.title,
      body: nextPost.body,
      tags: nextPost.tags.join(", "),
    };
  }

  function parseTags(value: string): string[] {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  async function handleLoadPost(): Promise<void> {
    const id = toPositiveId(postId);

    if (!id) {
      setError("Informe um ID valido maior que zero.");
      setStatus(null);
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {

      const data: Post = await api.getPostById(id);
      setPost(data);
      setForm(mapPostToFormState(data));
      setStatus("Post carregado com sucesso.");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado ao carregar post.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePost(): Promise<void> {
    if (!post) {
      setError("Carregue um post antes de atualizar.");
      return;
    }
    setSaving(true);
    setError(null);
    setStatus(null);

    try {
      const payload = {
        title: form.title,
        body: form.body,
        tags: parseTags(form.tags),
      };

      const updatedPost: Post = await api.updatePost(post.id, payload);
      setPost(updatedPost);

      setForm(mapPostToFormState(updatedPost));
      setStatus("Post atualizado com sucesso.");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado ao atualizar post.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(): Promise<void> {
    if (!post) {
      setError("Carregue um post antes de excluir.");
      return;
    }

    setDeleting(true);
    setError(null);
    setStatus(null);

    try {
      const deleted: Post = await api.deletePost(post.id);
      setPost(null);
      setForm({ title: "", body: "", tags: "" });
      setStatus(
        deleted.isDeleted
          ? `Post ${deleted.id} excluido com sucesso.`
          : "Resposta recebida sem confirmacao de exclusao.",
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado ao excluir post.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Editar post</h1>
        <p className="text-sm text-muted-foreground">
          Edite ou exclua o post com integracao na API DummyJSON.
        </p>
      </header>

      {error ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {status ? (
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>{status}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Formulario de edicao #{postId}</CardTitle>
          <CardDescription>
            {post
              ? "Ajuste os campos e clique em atualizar."
              : "Carregue um post para habilitar a edicao."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {post ? (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">ID {post.id}</Badge>
              <Badge variant="outline">Usuario {post.userId}</Badge>
              <Badge variant="outline">{post.reactions.likes} curtidas</Badge>
              <Badge variant="outline">{post.views} visualizacoes</Badge>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="post-title">Titulo</Label>
            <Input
              id="post-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              disabled={!post || saving || deleting}
              placeholder="Titulo do post"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-body">Conteudo</Label>
            <Textarea
              id="post-body"
              value={form.body}
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              disabled={!post || saving || deleting}
              placeholder="Texto do post"
              className="min-h-36"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-tags">Tags (separadas por virgula)</Label>
            <Input
              id="post-tags"
              value={form.tags}
              onChange={(event) =>
                setForm((current) => ({ ...current, tags: event.target.value }))
              }
              disabled={!post || saving || deleting}
              placeholder="news, react, api"
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            onClick={() => void handleUpdatePost()}
            disabled={!post || saving || deleting}
          >
            {saving ? "Salvando..." : "Atualizar"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleDeletePost()}
            disabled={!post || saving || deleting}
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
