// Input Validation — Zod schemas for all API endpoints.

import { z } from "zod";

/** Email address format */
const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Validate email address */
export const emailSchema = z.object({
  address: z.string().regex(emailRe, "Invalid email address").max(254),
  password: z.string().min(1).max(128),
});

/** Validate Guerrilla Mail session token */
export const sidTokenSchema = z.string().min(10).max(100);

/** Validate email query parameter */
export const emailQuerySchema = z.object({
  address: z.string().regex(emailRe, "Invalid email address").max(254),
});

/** Validate message ID parameter */
export const messageIdSchema = z.object({
  id: z.string().min(1).max(50),
});

/** Validate custom email prefix */
export const emailPrefixSchema = z.object({
  prefix: z
    .string()
    .min(1, "Prefix is required")
    .max(30, "Prefix must be 30 characters or less")
    .regex(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, dots, hyphens, and underscores allowed"),
});

/**
 * Safe parse helper — returns { success, data, errors }.
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
  };
}
