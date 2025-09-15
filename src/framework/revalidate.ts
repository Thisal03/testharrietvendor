'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const invalidateTag = async (tag: string) => {
  revalidateTag(tag);
};

export const invalidatePath = async (path: string) => {
  revalidatePath(path);
};
