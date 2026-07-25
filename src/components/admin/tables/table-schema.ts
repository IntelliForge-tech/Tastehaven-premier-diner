import { z } from "zod";

export const TABLE_SHAPES = ["square", "rectangle", "circle", "oval", "booth", "custom"] as const;
export const TABLE_STATUSES = ["available", "reserved", "occupied", "cleaning", "maintenance", "disabled", "merge_pending"] as const;

export const floorSchema = z.object({
  name: z.string().min(1, "Floor name is required.").max(80, "Floor name must be 80 characters or fewer."),
  description: z.string().max(300).default(""),
  displayOrder: z.number().int().min(0).default(0),
  maxCapacity: z
    .number({ invalid_type_error: "Max capacity must be a number." })
    .int()
    .min(1)
    .nullable()
    .optional(),
  isActive: z.boolean().default(true),
});

export type FloorFormValues = z.infer<typeof floorSchema>;

export const tableSchema = z.object({
  floorId: z.string().min(1, "Please select a floor."),
  tableNumber: z.string().min(1, "Table number is required.").max(10, "Table number must be 10 characters or fewer."),
  tableName: z.string().max(60).default(""),
  capacity: z
    .number({ invalid_type_error: "Capacity must be a number." })
    .int()
    .min(1, "Capacity must be at least 1.")
    .max(50, "Capacity cannot exceed 50."),
  minGuests: z.number().int().min(1).nullable().optional(),
  maxGuests: z.number().int().min(1).nullable().optional(),
  shape: z.enum(TABLE_SHAPES),
  positionX: z.number().default(50),
  positionY: z.number().default(50),
  rotation: z.number().min(0).max(360).default(0),
  notes: z.string().max(300).default(""),
  isActive: z.boolean().default(true),
});

export type TableFormValues = z.infer<typeof tableSchema>;
