"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	deletePublicacao,
	getByIdPublicacao,
	getPublicacoes,
	postPublicacao,
	putPublicacao,
	type Publicacao,
} from "@/service/publicacao";

type FormState = {
	title: string;
	body: string;
	tags: string;
	likes: string;
	dislikes: string;
	views: string;
	userId: string;
};

const initialForm: FormState = {
	title: "",
	body: "",
	tags: "",
	likes: "0",
	dislikes: "0",
	views: "0",
	userId: "1",
};

const toNonNegativeNumber = (value: string): number => {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : 0;
};

export default function PublicacoesPage() {
	const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
	const [form, setForm] = useState<FormState>(initialForm);
	const [editandoId, setEditandoId] = useState<number | null>(null);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState<string | null>(null);

	useEffect(() => {
		const carregarPublicacoes = async () => {
			try {
				const dados = await getPublicacoes();
				setPublicacoes(dados);
			} catch {
				setErro("Nao foi possivel carregar as publicacoes.");
			} finally {
				setCarregando(false);
			}
		};

		carregarPublicacoes();
	}, []);

	const totalPublicacoes = useMemo(() => publicacoes.length, [publicacoes]);

	const limparFormulario = () => {
		setForm(initialForm);
		setEditandoId(null);
	};

	const preencherFormulario = (publicacao: Publicacao) => {
		setForm({
			title: publicacao.title,
			body: publicacao.body,
			tags: publicacao.tags.join(", "),
			likes: String(publicacao.reactions.likes),
			dislikes: String(publicacao.reactions.dislikes),
			views: String(publicacao.views),
			userId: String(publicacao.userId),
		});
	};

	const editarPublicacao = async (id: number) => {
		const publicacao = await getByIdPublicacao(id);

		if (!publicacao) {
			setErro("Publicacao nao encontrada.");
			return;
		}

		setErro(null);
		setEditandoId(id);
		preencherFormulario(publicacao);
	};

	const salvarPublicacao = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErro(null);

		if (!form.title.trim() || !form.body.trim()) {
			setErro("Titulo e conteudo sao obrigatorios.");
			return;
		}

		const tags = form.tags
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);

		const payload: Publicacao = {
			id: editandoId ?? Math.max(0, ...publicacoes.map((p) => p.id)) + 1,
			title: form.title.trim(),
			body: form.body.trim(),
			tags,
			reactions: {
				likes: toNonNegativeNumber(form.likes),
				dislikes: toNonNegativeNumber(form.dislikes),
			},
			views: toNonNegativeNumber(form.views),
			userId: toNonNegativeNumber(form.userId),
		};

		if (editandoId) {
			const atualizado = await putPublicacao(editandoId, payload);
			setPublicacoes((anterior) => anterior.map((p) => (p.id === editandoId ? atualizado : p)));
		} else {
			const criado = await postPublicacao(payload);
			setPublicacoes((anterior) => [criado, ...anterior]);
		}

		limparFormulario();
	};

	const removerPublicacao = async (id: number) => {
		await deletePublicacao(id);
		setPublicacoes((anterior) => anterior.filter((p) => p.id !== id));

		if (editandoId === id) {
			limparFormulario();
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
			<header className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight text-zinc-900">CRUD de Publicacoes</h1>
				<p className="text-sm text-zinc-600">
					Gerencie publicacoes com {" "}
					<span className="font-semibold">useState</span>
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
									onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
									placeholder="Digite o titulo"
								/>
							</div>

							<div className="space-y-1">
								<Label htmlFor="body">Conteudo</Label>
								<Textarea
									id="body"
									value={form.body}
									onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
									placeholder="Escreva o conteudo da publicacao"
								/>
							</div>

							<div className="space-y-1">
								<Label htmlFor="tags">Tags</Label>
								<Input
									id="tags"
									value={form.tags}
									onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
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
										onChange={(event) => setForm((prev) => ({ ...prev, likes: event.target.value }))}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="dislikes">Dislikes</Label>
									<Input
										id="dislikes"
										type="number"
										min={0}
										value={form.dislikes}
										onChange={(event) => setForm((prev) => ({ ...prev, dislikes: event.target.value }))}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="views">Views</Label>
									<Input
										id="views"
										type="number"
										min={0}
										value={form.views}
										onChange={(event) => setForm((prev) => ({ ...prev, views: event.target.value }))}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="userId">User ID</Label>
									<Input
										id="userId"
										type="number"
										min={1}
										value={form.userId}
										onChange={(event) => setForm((prev) => ({ ...prev, userId: event.target.value }))}
									/>
								</div>
							</div>

							{erro ? <p className="text-sm font-medium text-red-600">{erro}</p> : null}

							<div className="flex gap-2">
								<Button type="submit" className="flex-1">
									{editandoId ? "Salvar alteracoes" : "Criar publicacao"}
								</Button>
								{editandoId ? (
									<Button type="button" variant="outline" onClick={limparFormulario}>
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
											<Button type="button" size="sm" variant="secondary" onClick={() => editarPublicacao(publicacao.id)}>
												Editar
											</Button>
											<Button
												type="button"
												size="sm"
												variant="destructive"
												onClick={() => removerPublicacao(publicacao.id)}
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
