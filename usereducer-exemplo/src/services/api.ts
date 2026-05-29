import { Post, PostsResponse } from "@/types/post";

const URL_BASE = "https://dummyjson.com/";

const POSTS_ENDPOINT = `${URL_BASE}posts`;

const getAllPosts = async (): Promise<Array<Post>> => {
  const response = await fetch(POSTS_ENDPOINT);

  if (!response.ok) {
    throw new Error(`Erro ao buscar posts: ${response.status}`);
  }

  const data: PostsResponse = await response.json();
  return data.posts;
}

const getPostById = async (id: number): Promise<Post> => {
  const response = await fetch(`${POSTS_ENDPOINT}/${id}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar post: ${response.status}`);
  }

  const post = await response.json();
  return post;
}

const updatePost = async (id: number, payload: Partial<Post>): Promise<Post> => {
  const response = await fetch(`${POSTS_ENDPOINT}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {   
        throw new Error(
          `Nao foi possivel atualizar o post (${response.status}).`,
        );
  }

  return await response.json();
}

const deletePost = async (id: number): Promise<Post> => {
  const response = await fetch(`${POSTS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      `Nao foi possivel excluir o post (${response.status}).`,
    );
  }

  return await response.json();
}

export const api = {
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
};