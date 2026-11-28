import { readdir, readFile, writeFile } from "node:fs/promises";

import { parseQuestionBank, type RawQuestionFile } from "@/lib/questionSchema";
import { buildSeedSql } from "@/lib/seedSql";

const contentDir = new URL("../content/questions/", import.meta.url);
const seedFile = new URL("../supabase/seed.sql", import.meta.url);

async function readQuestionFiles(): Promise<RawQuestionFile[]> {
  const fileNames = (await readdir(contentDir)).filter((name) => name.endsWith(".json")).sort();

  return Promise.all(
    fileNames.map(async (fileName) => {
      const text = await readFile(new URL(fileName, contentDir), "utf8");
      try {
        return { fileName, data: JSON.parse(text) as unknown };
      } catch (error) {
        throw new Error(`${fileName}: JSON inválido (${(error as Error).message}).`);
      }
    }),
  );
}

try {
  const files = parseQuestionBank(await readQuestionFiles());
  await writeFile(seedFile, buildSeedSql(files));

  const total = files.reduce((sum, { questions }) => sum + questions.length, 0);
  console.log(`supabase/seed.sql gerado: ${files.length} temas, ${total} questões.`);
  console.log("Para aplicar no banco: bunx supabase db push --remote --include-seed");
} catch (error) {
  console.error(`Seed interrompido. ${(error as Error).message}`);
  process.exit(1);
}
