import { z } from 'zod';

const Equipment = z.object({
    Id_Equipment:z.string(),
    name:z.string(),
})

type RegisterEquipment = z.infer<typeof Equipment>;

export const EquipmentStatus = z.enum([
  "AVAILABLE",
  "ASSIGNED",
  "MAINTENANCE",
  "RETIRED",
]);

export const CreateEquipment = z.object({
    name:z.string(),
    SerialNumber:z.string()
});