"use client";

import { useForm } from "react-hook-form";

type LoginForm = {
    email: string;
    password: string;
};

const LoginPage = () => {
    const { 
        register, 
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: LoginForm) => {
        // chamada api ou serviço
        console.log(data);
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-10 text-slate-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/30 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute left-0 top-1/3 h-60 w-60 rounded-full bg-emerald-400/20 blur-3xl" />
            </div>

            <section className="relative w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-8 space-y-2 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Acesso seguro</p>
                    <h1 className="text-3xl font-bold leading-tight text-white">Entre na sua conta</h1>
                    <p className="text-sm text-slate-300">Faça login para continuar sua jornada na plataforma.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-200">
                            E-mail
                        </label>
                        <input
                            id="email"
                            {...register("email", {required: "O e-mail é obrigatório"})}
                            placeholder="voce@email.com"
                            className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none ring-cyan-400/70 transition focus:ring-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-slate-200">
                            Senha
                        </label>
                        <input
                            id="password"
                            {...register("password", {required: "A senha é obrigatória"})}
                            type="password"
                            placeholder="Digite sua senha"
                            className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none ring-cyan-400/70 transition focus:ring-2"
                        />
                    </div>
                    {errors.email && <p>{errors.email.message}</p>}
                    {errors.password && <p>{errors.password.message}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] hover:brightness-110 active:scale-[0.99]"
                    >
                        Entrar
                    </button>
                </form>
            </section>
        </main>
    );
};

export default LoginPage;