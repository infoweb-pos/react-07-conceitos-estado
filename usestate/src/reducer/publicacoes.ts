import {
  deletePublicacao,
  getByIdPublicacao,
  getPublicacoes,
  postPublicacao,
  putPublicacao,
  type Publicacao,
} from "@/service/publicacao";

export type FormState = {
  title: string;
  body: string;
  tags: string;
  likes: string;
  dislikes: string;
  views: string;
  userId: string;
};

export type PublicacoesState = {
  publicacoes: Publicacao[];
  form: FormState;
  editandoId: number | null;
  carregando: boolean;
  erro: string | null;
};

export const initialForm: FormState = {
  title: "",
  body: "",
  tags: "",
  likes: "0",
  dislikes: "0",
  views: "0",
  userId: "1",
};

export const initialPublicacoesState: PublicacoesState = {
  publicacoes: [],
  form: initialForm,
  editandoId: null,
  carregando: true,
  erro: null,
};

type PublicacoesAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PUBLICACOES"; payload: Publicacao[] }
  | { type: "SET_FORM_FIELD"; payload: { field: keyof FormState; value: string } }
  | { type: "START_EDIT"; payload: { id: number; form: FormState } }
  | { type: "RESET_FORM" }
  | { type: "UPSERT_PUBLICACAO"; payload: Publicacao }
  | { type: "REMOVE_PUBLICACAO"; payload: number };

export function publicacoesReducer(
  state: PublicacoesState,
  action: PublicacoesAction
): PublicacoesState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, carregando: action.payload };

    case "SET_ERROR":
      return { ...state, erro: action.payload };

    case "SET_PUBLICACOES":
      return { ...state, publicacoes: action.payload };

    case "SET_FORM_FIELD":
      return {
        ...state,
        form: {
          ...state.form,
          [action.payload.field]: action.payload.value,
        },
      };

    case "START_EDIT":
      return {
        ...state,
        erro: null,
        editandoId: action.payload.id,
        form: action.payload.form,
      };

    case "RESET_FORM":
      return {
        ...state,
        form: initialForm,
        editandoId: null,
      };

    case "UPSERT_PUBLICACAO": {
      const jaExiste = state.publicacoes.some((p) => p.id === action.payload.id);
      return {
        ...state,
        publicacoes: jaExiste
          ? state.publicacoes.map((p) => (p.id === action.payload.id ? action.payload : p))
          : [action.payload, ...state.publicacoes],
      };
    }

    case "REMOVE_PUBLICACAO":
      return {
        ...state,
        publicacoes: state.publicacoes.filter((p) => p.id !== action.payload),
      };

    default:
      return state;
  }
}

const toNonNegativeNumber = (value: string): number => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const publicacaoToForm = (publicacao: Publicacao): FormState => ({
  title: publicacao.title,
  body: publicacao.body,
  tags: publicacao.tags.join(", "),
  likes: String(publicacao.reactions.likes),
  dislikes: String(publicacao.reactions.dislikes),
  views: String(publicacao.views),
  userId: String(publicacao.userId),
});

const formToPublicacao = (
  form: FormState,
  id: number,
  publicacoes: Publicacao[]
): Publicacao => {
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    id: id || Math.max(0, ...publicacoes.map((p) => p.id)) + 1,
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
};

export async function carregarPublicacoes(dispatch: (action: PublicacoesAction) => void) {
  dispatch({ type: "SET_LOADING", payload: true });

  try {
    const dados = await getPublicacoes();
    dispatch({ type: "SET_PUBLICACOES", payload: dados });
    dispatch({ type: "SET_ERROR", payload: null });
  } catch {
    dispatch({ type: "SET_ERROR", payload: "Nao foi possivel carregar as publicacoes." });
  } finally {
    dispatch({ type: "SET_LOADING", payload: false });
  }
}

export async function editarPublicacao(
  dispatch: (action: PublicacoesAction) => void,
  id: number
) {
  const publicacao = await getByIdPublicacao(id);

  if (!publicacao) {
    dispatch({ type: "SET_ERROR", payload: "Publicacao nao encontrada." });
    return;
  }

  dispatch({ type: "START_EDIT", payload: { id, form: publicacaoToForm(publicacao) } });
}

export async function salvarPublicacao(
  state: PublicacoesState,
  dispatch: (action: PublicacoesAction) => void
) {
  dispatch({ type: "SET_ERROR", payload: null });

  if (!state.form.title.trim() || !state.form.body.trim()) {
    dispatch({ type: "SET_ERROR", payload: "Titulo e conteudo sao obrigatorios." });
    return;
  }

  const payload = formToPublicacao(
    state.form,
    state.editandoId ?? 0,
    state.publicacoes
  );

  if (state.editandoId) {
    const atualizado = await putPublicacao(state.editandoId, payload);
    dispatch({ type: "UPSERT_PUBLICACAO", payload: atualizado });
  } else {
    const criado = await postPublicacao(payload);
    dispatch({ type: "UPSERT_PUBLICACAO", payload: criado });
  }

  dispatch({ type: "RESET_FORM" });
}

export async function removerPublicacao(
  state: PublicacoesState,
  dispatch: (action: PublicacoesAction) => void,
  id: number
) {
  await deletePublicacao(id);
  dispatch({ type: "REMOVE_PUBLICACAO", payload: id });

  if (state.editandoId === id) {
    dispatch({ type: "RESET_FORM" });
  }
}

export function atualizarCampoFormulario(
  dispatch: (action: PublicacoesAction) => void,
  field: keyof FormState,
  value: string
) {
  dispatch({ type: "SET_FORM_FIELD", payload: { field, value } });
}

export function limparFormulario(dispatch: (action: PublicacoesAction) => void) {
  dispatch({ type: "RESET_FORM" });
}