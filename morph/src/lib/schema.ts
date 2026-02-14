import { z } from "zod";

export const ModeEnum = z.enum(["reflective", "analytical", "planning"]);

export const MorphResponseSchema = z.object({
  mode: ModeEnum,
  assistant_response: z.string(),
  workspace_payload: z.record(z.string(), z.any()).nullable(),

});

export type MorphResponse = z.infer<typeof MorphResponseSchema>;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
