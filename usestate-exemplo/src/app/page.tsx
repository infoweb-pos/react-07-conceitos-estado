// src/app/page.tsx
import PostForm from "@/components/post/form";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-background">
      <h1 className="text-2xl font-bold text-center mb-6">
        Tutorial useState — DummyJSON
      </h1>
      <PostForm />
    </main>
  );
}