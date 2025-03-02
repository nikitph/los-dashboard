"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createCrudActionsFactory<T extends z.ZodType<any>, U extends z.ZodType<any>>(
  modelName: string,
  createSchema: T,
  updateSchema: U,
  basePath: string,
  {
    create,
    getById,
    update,
    delete: deleteFunc,
    list,
  }: {
    create: (data: z.infer<T>) => Promise<any>;
    getById: (id: string) => Promise<any>;
    update: (id: string, data: z.infer<U>) => Promise<any>;
    delete: (id: string) => Promise<any>;
    list: () => Promise<any[]>;
  },
) {
  // The function itself doesn't need to be async, but it returns an object with async functions
  return {
    // All exported functions need to be async
    create: async (data: z.infer<T>) => {
      try {
        const item = await create(data);
        revalidatePath(`${basePath}/list`);
        return { success: true, data: item };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : `Failed to create ${modelName}`,
        };
      }
    },

    getById: async (id: string) => {
      try {
        const item = await getById(id);
        return { success: true, data: item };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : `Failed to fetch ${modelName}`,
        };
      }
    },

    update: async (id: string, data: z.infer<U>) => {
      try {
        const item = await update(id, data);
        revalidatePath(`${basePath}/list`);
        revalidatePath(`${basePath}/${id}`);
        return { success: true, data: item };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : `Failed to update ${modelName}`,
        };
      }
    },

    delete: async (id: string) => {
      try {
        await deleteFunc(id);
        revalidatePath(`${basePath}/list`);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : `Failed to delete ${modelName}`,
        };
      }
    },

    list: async () => {
      try {
        const items = await list();
        return { success: true, data: items };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : `Failed to fetch ${modelName} list`,
        };
      }
    },
  };
}
