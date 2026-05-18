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