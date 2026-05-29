import { api } from "@/services/api";
import { Post } from "@/types/post";

export type PostState = {
    posts: Post[];
    selectedId?: number | null;
    currentPost?: Post | null;
    loading: boolean;
    error: string | null;
    status: string | null;
};

export type PostAction =
  | { type: "LIST_LOADING" }
  | { type: "LIST_SUCCESS"; payload: Post[] }
  | { type: "LIST_ERROR"; payload: string }
  | { type: "SELECT_POST"; payload: number }
  | { type: "DETAIL_LOADING" }
  | { type: "DETAIL_SUCCESS"; payload: Post }
  | { type: "DETAIL_ERROR"; payload: string }
  | { type: "UPDATE_SUCCESS"; payload: Post }
  | { type: "DELETE_SUCCESS" }
  | { type: "CLEAR_STATUS" };


const postReducer = async (state: PostState, action: PostAction): Promise<PostState> => {
    switch (action.type) {
        case "LIST_LOADING":
            const posts = await api.getAllPosts();
            return { ...state, posts: posts, loading: true, error: null };
        default:
            return state;
    }
}

export {postReducer};