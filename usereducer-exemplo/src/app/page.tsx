"use client";

import { useEffect, useReducer, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/services/api";

const redutorDeTarefas = async (estado, acao) => {
  // estado = lista de publicacoes
  // acao   = a. type que representa a acao a ser realizada (ex: "CARREGAR_PUBLICACOES", "ADICIONAR_PUBLICACAO", "ATUALIZAR_PUBLICACAO", "EXCLUIR_PUBLICACAO")
  //          b. payload (dados necessarios para realizar a acao, ex: nova publicacao, id da publicacao a ser atualizada/excluida, etc)
  // acao.type e acao.payload
  // return é o novo estado atualizado apos a acao ser realizada alguma operação
  switch (acao.type) {
    case "CARREGAR_PUBLICACOES": {
      const publicacoes = await api.getAllPosts();
      console.log(publicacoes);
      return [...estado, {
        "id": 1,
        "title": "His mother had always taught him",
        "body": "His mother had always taught him not to ever think of himself as better than others. He'd tried to live by this motto. He never looked down on those who were less fortunate or who had less money than him. But the stupidity of the group of people he was talking to made him change his mind.",
        "tags": [
          "history",
          "american",
          "crime"
        ],
        "reactions": {
          "likes": 192,
          "dislikes": 25
        },
        "views": 305,
        "userId": 121
      }]; // payload = lista de publicacoes
    }
  }
};

export default function Home() {
  // const [posts, setPosts] = useState<Post[]>([]);
  const [posts, despachador] = useReducer(redutorDeTarefas, []); // publicacoes = estado, despachador = funcao para disparar a acao (dispatch)
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handle = () => {
    despachador("CARREGAR_PUBLICACOES");
    
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Lista de publicações
        </h1>
      </header>

      <div className="flex items-center gap-3">
        <Button onClick={() => handle()}>
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
            <Button variant="destructive">
              Tentar novamente
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">

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
