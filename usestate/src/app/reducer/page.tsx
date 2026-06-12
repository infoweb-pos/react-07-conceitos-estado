"use client";

import { useEffect, useMemo, useReducer } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    atualizarCampoFormulario,
    carregarPublicacoes,
    editarPublicacao,
    initialPublicacoesState,
    limparFormulario,
    publicacoesReducer,
    removerPublicacao,
    salvarPublicacao as salvarPublicacaoReducer,
} from "@/reducer/publicacoes";

export default function PublicacoesPage() {
    const [state, dispatch] = useReducer(publicacoesReducer, initialPublicacoesState);
    const { publicacoes, form, editandoId, carregando, erro } = state;

    useEffect(() => {
        carregarPublicacoes(dispatch);
    }, []);

    const totalPublicacoes = useMemo(() => publicacoes.length, [publicacoes]);

    const salvarPublicacao = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await salvarPublicacaoReducer(state, dispatch);
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">CRUD de Publicacoes</h1>
                <p className="text-sm text-zinc-600">
                    Gerencie publicacoes com {" "}
                    <span className="font-semibold">useReducer</span>
                    : criar, listar, editar e excluir.
                </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>{editandoId ? "Editar publicacao" : "Nova publicacao"}</CardTitle>
                        <CardDescription>
                            Preencha os campos abaixo para {editandoId ? "atualizar" : "cadastrar"} uma publicacao.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form className="space-y-4" onSubmit={salvarPublicacao}>
                            <div className="space-y-1">
                                <Label htmlFor="title">Titulo</Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(event) => atualizarCampoFormulario(dispatch, "title", event.target.value)}
                                    placeholder="Digite o titulo"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="body">Conteudo</Label>
                                <Textarea
                                    id="body"
                                    value={form.body}
                                    onChange={(event) => atualizarCampoFormulario(dispatch, "body", event.target.value)}
                                    placeholder="Escreva o conteudo da publicacao"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="tags">Tags</Label>
                                <Input
                                    id="tags"
                                    value={form.tags}
                                    onChange={(event) => atualizarCampoFormulario(dispatch, "tags", event.target.value)}
                                    placeholder="ex: react, frontend, hooks"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="likes">Likes</Label>
                                    <Input
                                        id="likes"
                                        type="number"
                                        min={0}
                                        value={form.likes}
                                        onChange={(event) => atualizarCampoFormulario(dispatch, "likes", event.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="dislikes">Dislikes</Label>
                                    <Input
                                        id="dislikes"
                                        type="number"
                                        min={0}
                                        value={form.dislikes}
                                        onChange={(event) => atualizarCampoFormulario(dispatch, "dislikes", event.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="views">Views</Label>
                                    <Input
                                        id="views"
                                        type="number"
                                        min={0}
                                        value={form.views}
                                        onChange={(event) => atualizarCampoFormulario(dispatch, "views", event.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="userId">User ID</Label>
                                    <Input
                                        id="userId"
                                        type="number"
                                        min={1}
                                        value={form.userId}
                                        onChange={(event) => atualizarCampoFormulario(dispatch, "userId", event.target.value)}
                                    />
                                </div>
                            </div>

                            {erro ? <p className="text-sm font-medium text-red-600">{erro}</p> : null}

                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">
                                    {editandoId ? "Salvar alteracoes" : "Criar publicacao"}
                                </Button>
                                {editandoId ? (
                                    <Button type="button" variant="outline" onClick={() => limparFormulario(dispatch)}>
                                        Cancelar
                                    </Button>
                                ) : null}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de publicacoes</CardTitle>
                        <CardDescription>Total: {totalPublicacoes}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {carregando ? <p className="text-sm text-zinc-600">Carregando publicacoes...</p> : null}

                        {!carregando && publicacoes.length === 0 ? (
                            <p className="text-sm text-zinc-600">Nenhuma publicacao encontrada.</p>
                        ) : null}

                        {!carregando
                            ? publicacoes.map((publicacao) => (
                                    <article key={publicacao.id} className="rounded-lg border border-zinc-200 p-4">
                                        <div className="mb-2 flex items-start justify-between gap-3">
                                            <h2 className="text-base font-semibold text-zinc-900">{publicacao.title}</h2>
                                            <span className="text-xs text-zinc-500">#{publicacao.id}</span>
                                        </div>

                                        <p className="mb-3 line-clamp-3 text-sm text-zinc-700">{publicacao.body}</p>

                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                            {publicacao.tags.map((tag) => (
                                                <Badge key={`${publicacao.id}-${tag}`} variant="outline">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 md:grid-cols-4">
                                            <span>Likes: {publicacao.reactions.likes}</span>
                                            <span>Dislikes: {publicacao.reactions.dislikes}</span>
                                            <span>Views: {publicacao.views}</span>
                                            <span>User: {publicacao.userId}</span>
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => editarPublicacao(dispatch, publicacao.id)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => removerPublicacao(state, dispatch, publicacao.id)}
                                            >
                                                Excluir
                                            </Button>
                                        </div>
                                    </article>
                                ))
                            : null}
                    </CardContent>

                    <CardFooter>
                        <p className="text-xs text-zinc-600">Dados locais em memoria para fins de estudo.</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
