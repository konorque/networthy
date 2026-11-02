import type { CategoryInput } from './categories.schemas.js';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../lib/HttpError.js';
import { Prisma } from '../../generated/prisma/client.js';

export async function createCategory(userId: string, input: CategoryInput) {
  try {
    return await prisma.category.create({
      data: { name: input.name, userId },
      select: { id: true, name: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new HttpError(409, 'Category already exists');
    }
    throw err;
  }
}

export async function listCategories(userId: string) {
  const list = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  return list;
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: CategoryInput,
) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) throw new HttpError(404, 'Category not found');
  try {
    return await prisma.category.update({
      where: { id: categoryId },
      data: { name: input.name },
      select: { id: true, name: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new HttpError(409, 'Category already exists');
    }
    throw err;
  }
}

export async function deleteCategory(userId: string, categoryId: string) {
  const result = await prisma.category.deleteMany({
    where: { id: categoryId, userId },
  });
  if (result.count === 0) throw new HttpError(404, 'Category not found');
}
