import { z } from "zod";

const lowercase = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
const lettersAndDigits = lowercase + lowercase.toUpperCase() + digits;

function onlyChars(value: string, allowed: string): boolean {
  return [...value].every((char) => allowed.includes(char));
}

// Começa com letra minúscula e só tem letras e números (ex.: associacaoLogica).
function isCamelCase(value: string): boolean {
  return value.length > 0 && lowercase.includes(value[0]) && onlyChars(value, lettersAndDigits);
}

// Letras minúsculas, um hífen e ao menos dois dígitos (ex.: frac-01).
function isQuestionId(value: string): boolean {
  const parts = value.split("-");
  if (parts.length !== 2) return false;

  const [prefix, number] = parts;
  return prefix.length > 0 && onlyChars(prefix, lowercase) && number.length >= 2 && onlyChars(number, digits);
}

const nonBlank = z.string().refine((value) => value.trim().length > 0, "não pode ficar vazio");

const topicSchema = z.strictObject({
  slug: z.string().refine(isCamelCase, "o slug precisa estar em camelCase"),
  name: z.string().min(1).max(80),
  sort_order: z.int().min(1),
});

const questionSchema = z.strictObject({
  id: z.string().refine(isQuestionId, "o id precisa seguir o formato prefixo-01"),
  difficulty: z.int().min(1).max(3),
  statement: nonBlank,
  premises: z.array(nonBlank).min(1).optional(),
  prompt: nonBlank,
  options: z
    .array(nonBlank)
    .length(5, "precisa ter exatamente 5 alternativas")
    .refine((options) => new Set(options).size === options.length, "tem alternativas repetidas"),
  correct_index: z.int().min(0).max(4),
  explanation: nonBlank,
});

const questionFileSchema = z.strictObject({
  topic: topicSchema,
  questions: z.array(questionSchema).min(1, "precisa ter ao menos uma questão"),
});

export type QuestionFile = z.infer<typeof questionFileSchema>;

export type RawQuestionFile = {
  fileName: string;
  data: unknown;
};

export function parseQuestionBank(files: readonly RawQuestionFile[]): QuestionFile[] {
  if (files.length === 0) {
    throw new Error("Nenhum arquivo de questões encontrado.");
  }

  const fileByQuestionId = new Map<string, string>();
  const fileBySortOrder = new Map<number, string>();

  return files.map(({ fileName, data }) => {
    const result = questionFileSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`${fileName}:\n${z.prettifyError(result.error)}`);
    }

    const { topic, questions } = result.data;
    const expectedSlug = fileName.endsWith(".json") ? fileName.slice(0, -".json".length) : fileName;
    if (topic.slug !== expectedSlug) {
      throw new Error(`${fileName}: o slug "${topic.slug}" precisa ser igual ao nome do arquivo ("${expectedSlug}").`);
    }

    const sameOrder = fileBySortOrder.get(topic.sort_order);
    if (sameOrder) {
      throw new Error(`${fileName}: sort_order ${topic.sort_order} já é usado em ${sameOrder}.`);
    }
    fileBySortOrder.set(topic.sort_order, fileName);

    for (const { id } of questions) {
      const sameId = fileByQuestionId.get(id);
      if (sameId) {
        throw new Error(`${fileName}: o id "${id}" já é usado em ${sameId}.`);
      }
      fileByQuestionId.set(id, fileName);
    }

    return result.data;
  });
}
