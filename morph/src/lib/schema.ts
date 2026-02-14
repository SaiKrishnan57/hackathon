import { z } from "zod";

export const ModeEnum = z.enum(["reflective", "analytical", "planning"]);

const WidgetSchema = z.object({
  id: z.string(), // stable id like "brief", "comparison", "timeline"
  type: z.enum([
    "brief",
    "assumptions",
    "comparison_table",
    "timeline",
    "next_actions"
  ]),
  title: z.string().optional(),
  priority: z.number().min(0).max(100).optional(), // higher = more important
  data: z.record(z.string(), z.any()).default({})
});

export const MorphResponseSchema = z.object({
  mode: ModeEnum,
  assistant_response: z.string(),
  // dashboard operation model
  dashboard: z.object({
    // choose exactly one action
    action: z.enum(["set", "patch"]),
    widgets: z.array(WidgetSchema)
  })
});

export type MorphResponse = z.infer<typeof MorphResponseSchema>;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
