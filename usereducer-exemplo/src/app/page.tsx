"use client";

import { useCallback, useEffect, useState } from "react";
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
import type { Post, PostsResponse } from "@/types/post";
import { api } from "@/services/api";

const POSTS_ENDPOINT = "https://dummyjson.com/posts?limit=12";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const publicacoes = await api.getAllPosts();
      setPosts(publicacoes);

    } catch (fetchError) {
      if (
        fetchError instanceof DOMException &&
        fetchError.name === "AbortError"
      ) {
        return;
      }

      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Erro inesperado na requisicao.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    void loadPosts(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [loadPosts]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Lista de publicações
        </h1>
      </header>

      <div className="flex items-center gap-3">
        <Button onClick={() => void loadPosts()} disabled={loading}>
          {loading ? "Carregando..." : "Recarregar publicações"}
        </Button>
        <Badge variant="secondary">{posts.length} publicações</Badge>
      </div>

      {error ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">
              Falha ao carregar
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="destructive" onClick={() => void loadPosts()}>
              Tentar novamente
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription className="line-clamp-3">
                {post.body}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={`${post.id}-${tag}`} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-xs text-muted-foreground">
                Usuario {post.userId}
              </span>
              <span className="text-xs text-muted-foreground">
                {post.reactions.likes} curtidas - {post.views} visualizacoes
              </span>
            </CardFooter>
          </Card>
        ))}

        {!loading && posts.length === 0 && !error ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma publicação encontrada</CardTitle>
              <CardDescription>
                Use o botao acima para tentar carregar novamente.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
