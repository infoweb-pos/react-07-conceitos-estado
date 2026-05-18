"use client";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Contexto } from "@/context/UsuarioContext";
import Link from "next/link";

import { useContext } from "react";


export default function Home() {
  const [nome, setNome] = useContext(Contexto)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Página exemplo de useContext
          </h1>
          <div>
            <Field>
              <FieldLabel htmlFor="input-nome">Nome</FieldLabel>
              <Input id="input-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="informe o seu nome" />
              <FieldDescription>
                Informe o seu nome.
              </FieldDescription>
            </Field>
          </div>
          <div>
            <FieldLabel>{nome}</FieldLabel>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
