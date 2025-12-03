import {
  z,
  ZodTypeAny,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodDate,
  ZodArray,
  ZodObject,
} from "zod";

export function schemaToTypeMap(schema: z.ZodObject<any>): Record<string, string> {
  const shape = schema.shape;
  const map: Record<string, string> = {};
  for (const k in shape) {
    const t: ZodTypeAny = shape[k];
    if (t instanceof ZodString) map[k] = "string";
    else if (t instanceof ZodNumber) map[k] = "number";
    else if (t instanceof ZodBoolean) map[k] = "boolean";
    else if (t instanceof ZodDate) map[k] = "date";
    else if (t instanceof ZodArray) map[k] = "array";
    else if (t instanceof ZodObject) map[k] = "object";
    else map[k] = "object"; 
  }
  return map;
}

export type PrimitiveType = string | number | boolean | null | undefined;
