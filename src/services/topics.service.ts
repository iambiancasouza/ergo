import { createClient } from "@/lib/supabase/server";

type Topic = {
  id: number;
  slug: string;
  name: string;
  questionCount: number;
};

export async function getTopics(): Promise<Topic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .select("id, slug, name, questions(count)")
    .eq("questions.active", true)
    .order("sort_order");

  if (error) throw new Error(`Não foi possível carregar os temas: ${error.message}`);

  return data.map((topic) => ({
    id: topic.id,
    slug: topic.slug,
    name: topic.name,
    questionCount: topic.questions[0]?.count ?? 0,
  }));
}
