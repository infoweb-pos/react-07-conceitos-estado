"use client";

import UsuarioContext from "@/context/Usuario";
import { useContext } from "react";

const DashboardPage = () => {
    const usuario = useContext(UsuarioContext);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Usuário conectado
          </h1>
          <label>{usuario == "" ? "indefinido" : usuario}</label>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;