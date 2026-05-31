import { z } from "zod";

export const providerSchema = z.enum(["ollama", "llama-cpp"]);

export const modeSchema = z.object({
  thinking: z.boolean(),
  flash: z.boolean()
});

export const createChatSchema = z.object({
  title: z.string().optional(),
  model: z.string().optional(),
  provider: providerSchema.optional(),
  mode: modeSchema.optional()
});

export const sendMessageSchema = z.object({
  prompt: z.string().min(1),
  provider: providerSchema,
  model: z.string().min(1),
  mode: modeSchema
});

export const updateSettingsSchema = z.object({
  defaultProvider: providerSchema.optional(),
  ollamaBaseUrl: z.string().url().optional(),
  llamaCppBaseUrl: z.string().url().optional(),
  llamaModelsDir: z.string().min(1).optional()
});

export const downloadModelSchema = z.object({
  provider: providerSchema,
  model: z.string().optional(),
  hfRepo: z.string().optional(),
  fileName: z.string().optional()
});
