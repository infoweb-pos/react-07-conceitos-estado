# Hook `useForm` (`react-hook-form`) — Tutorial introdutório em 2 partes

## Objetivo

Apresentar o hook `useForm`, da biblioteca [React Hook Form](https://react-hook-form.com/), em duas partes:

1. **Parte 1:** instalação, conceitos introdutórios e validação com `zod`
2. **Parte 2:** exemplo completo com **Next.js**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** e `useForm` em um formulário de cadastro de usuário

**Tecnologias utilizadas:** Next.js · TypeScript · Tailwind CSS · shadcn/ui · React Hook Form · Zod

---

## 1. O que é o `useForm`?

O `useForm` é o hook principal do **React Hook Form**. Ele ajuda a:

- registrar campos de formulário
- capturar submissões
- validar dados
- acompanhar erros
- observar mudanças de valores

Uma das vantagens do React Hook Form é reduzir re-renderizações desnecessárias e simplificar o trabalho com formulários grandes.

### Sintaxe básica

```tsx
const form = useForm({
  defaultValues: {
    campo: "",
  },
});
```

### Principais recursos retornados pelo hook

| Recurso | Função |
|---|---|
| `register` | conecta inputs simples ao formulário |
| `handleSubmit` | processa a submissão com validação |
| `formState.errors` | contém os erros atuais |
| `watch` | observa mudanças em campos |
| `setValue` | atualiza valores manualmente |
| `reset` | restaura o formulário |
| `control` | integração com componentes mais complexos |

---

## 2. Parte 1 — instalação e conceitos introdutórios

### 2.1 Instalação

Em um projeto React ou Next.js, instale:

```bash
npm install react-hook-form zod @hookform/resolvers
```

Se o projeto ainda não existir, você pode começar com:

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

### 2.2 Exemplo mínimo com `register`

```tsx
"use client";

import { useForm } from "react-hook-form";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginForm) {
    console.log(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} placeholder="E-mail" />
      <input {...register("password")} type="password" placeholder="Senha" />
      <button type="submit">Entrar</button>
    </form>
  );
}
```

### 2.3 O que acontece nesse exemplo?

- `useForm<LoginForm>()` tipa os dados do formulário
- `defaultValues` define os valores iniciais
- `register("email")` conecta o campo ao formulário
- `handleSubmit(onSubmit)` valida e entrega os dados prontos

### 2.4 Exibindo erros de validação nativa

```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginForm>();

<input
  {...register("email", {
    required: "O e-mail é obrigatório",
  })}
/>
{errors.email && <p>{errors.email.message}</p>}
```

Esse formato funciona bem, mas em aplicações maiores costuma ficar mais organizado centralizar as regras em um schema com `zod`.

### 2.5 Validação com `zod`

```tsx
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Informe um e-mail válido"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
});
```

Agora conecte o schema ao `useForm`:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

const form = useForm<LoginForm>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});
```

### 2.6 Exemplo curto com erro exibido na tela

```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginForm>({
  resolver: zodResolver(loginSchema),
});

return (
  <form onSubmit={handleSubmit((data) => console.log(data))}>
    <input {...register("email")} placeholder="E-mail" />
    {errors.email && <p>{errors.email.message}</p>}

    <input {...register("password")} type="password" placeholder="Senha" />
    {errors.password && <p>{errors.password.message}</p>}

    <button type="submit">Enviar</button>
  </form>
);
```

### 2.7 Quando usar `watch`?

O `watch` é útil quando a interface depende do valor atual de um campo.

```tsx
const { register, watch } = useForm({
  defaultValues: { name: "" },
});

const name = watch("name");

return (
  <>
    <input {...register("name")} />
    <p>Olá, {name || "visitante"}!</p>
  </>
);
```

Esse recurso será usado na **Parte 2** para calcular a idade automaticamente a partir da data de nascimento.

---

## 3. Parte 2 — exemplo completo com Next.js, TypeScript, Tailwind CSS, shadcn/ui e `useForm`

Vamos montar um formulário de cadastro de usuário com os campos:

- nome completo
- data de nascimento
- idade (calculada automaticamente)
- apelido
- e-mail
- senha
- confirmação de senha

Também exibiremos um **alerta para menores de 18 anos** e usaremos componentes do **shadcn/ui** no formulário.

### 3.1 Criar o projeto

```bash
npx create-next-app@latest cadastro-usuario \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd cadastro-usuario
```

### 3.2 Instalar dependências

```bash
npm install react-hook-form zod @hookform/resolvers
```

### 3.3 Configurar o shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button card input form alert
```

### 3.4 Estrutura sugerida

```text
src/
├── app/
│   └── page.tsx
├── components/
│   └── ui/               ← componentes gerados pelo shadcn/ui
├── lib/
│   ├── date.ts
│   └── schemas/
│       └── user-register.ts
```

---

## 4. Schema de validação

Crie `src/lib/schemas/user-register.ts`:

```ts
import { z } from "zod";

export const userRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Informe o nome completo")
      .regex(/^\S+\s+\S+/, "Informe nome e sobrenome"),
    birthDate: z.string().min(1, "Informe a data de nascimento"),
    nickname: z
      .string()
      .min(2, "Informe um apelido com pelo menos 2 caracteres"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type UserRegisterFormData = z.infer<typeof userRegisterSchema>;
```

### O que esse schema garante?

- nome completo com pelo menos nome e sobrenome
- data de nascimento obrigatória
- apelido mínimo
- e-mail válido
- senha mínima
- confirmação igual à senha

---

## 5. Função para calcular idade

Crie `src/lib/date.ts`:

```ts
export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;

  const today = new Date();
  const birth = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(birth.getTime()) || birth > today) {
    return null;
  }

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}
```

---

## 6. Página principal com formulário completo

Crie `src/app/page.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { calculateAge } from "@/lib/date";
import {
  userRegisterSchema,
  type UserRegisterFormData,
} from "@/lib/schemas/user-register";

type SubmittedUser = UserRegisterFormData & {
  age: number | null;
};

export default function Home() {
  const [submittedUser, setSubmittedUser] = useState<SubmittedUser | null>(null);

  const form = useForm<UserRegisterFormData>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
      nickname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const birthDate = form.watch("birthDate");

  const age = useMemo(() => calculateAge(birthDate), [birthDate]);
  const isMinor = age !== null && age < 18;

  function onSubmit(values: UserRegisterFormData) {
    setSubmittedUser({
      ...values,
      age,
    });
  }

  return (
    <main className="container mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro de usuário</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Maria da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input
                      value={age ?? ""}
                      readOnly
                      placeholder="Calculada automaticamente"
                    />
                  </FormControl>
                </FormItem>
              </div>

              {isMinor && (
                <Alert className="border-amber-500 bg-amber-50 text-amber-900">
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    Usuários menores de 18 anos podem exigir autorização do responsável.
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apelido</FormLabel>
                    <FormControl>
                      <Input placeholder="mari" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="maria@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmação de senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit">Cadastrar</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSubmittedUser(null);
                  }}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </Form>

          {submittedUser && (
            <div className="space-y-2 rounded-lg border p-4">
              <h2 className="font-semibold">Dados enviados</h2>
              <pre className="overflow-x-auto rounded bg-muted p-4 text-sm">
                {JSON.stringify(submittedUser, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
```

---

## 7. O que esse exemplo demonstra?

### `useForm` com TypeScript

```tsx
const form = useForm<UserRegisterFormData>({
  resolver: zodResolver(userRegisterSchema),
  defaultValues: {
    fullName: "",
    birthDate: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
});
```

Aqui o formulário:

- usa tipagem forte
- recebe validação centralizada com `zod`
- começa com valores previsíveis

### `watch` para reagir à data de nascimento

```tsx
const birthDate = form.watch("birthDate");
const age = useMemo(() => calculateAge(birthDate), [birthDate]);
```

Sempre que a data mudar, a idade é recalculada.

### alerta para menor de idade

```tsx
const isMinor = age !== null && age < 18;
```

Esse valor controla a exibição do componente `Alert` do shadcn/ui.

### confirmação de senha com `refine`

```ts
.refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});
```

Essa regra compara dois campos diferentes no mesmo schema.

---

## 8. Resultado esperado

Ao preencher o formulário:

1. os erros aparecem abaixo dos campos
2. a idade é calculada automaticamente
3. o alerta aparece para menores de 18 anos
4. a submissão exibe os dados validados na tela

---

## 9. Conclusão

Com `useForm`, você separa melhor:

- estrutura visual do formulário
- captura de dados
- validação
- mensagens de erro

Quando combinado com **Zod** e com os componentes de formulário do **shadcn/ui**, o resultado fica escalável, tipado e organizado para projetos reais em Next.js.

---

## 10. Referências

- [React Hook Form — Documentação oficial](https://react-hook-form.com/)
- [React Hook Form — API `useForm`](https://react-hook-form.com/docs/useform)
- [Resolvers para React Hook Form](https://github.com/react-hook-form/resolvers)
- [Zod — Documentação](https://zod.dev/)
- [shadcn/ui — Form](https://ui.shadcn.com/docs/components/form)
- [Next.js — App Router](https://nextjs.org/docs/app)
