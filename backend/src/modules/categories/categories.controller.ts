import type { Request, Response } from 'express';
import { categoryInputSchema, categoryIdSchema } from './categories.schemas.js';
import {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
} from './categories.service.js';

export async function createCategoryHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const input = categoryInputSchema.parse(req.body);
  const category = await createCategory(userId, input);
  res.status(201).json(category);
}

export async function listCategoriesHandler(_req: Request, res: Response) {
  const userId = res.locals['userId'];
  const categories = await listCategories(userId);
  res.status(200).json(categories);
}

export async function updateCategoryHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const params = categoryIdSchema.parse(req.params);
  const input = categoryInputSchema.parse(req.body);
  const category = await updateCategory(userId, params.id, input);
  res.status(200).json(category);
}

export async function deleteCategoryHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const params = categoryIdSchema.parse(req.params);
  await deleteCategory(userId, params.id);
  res.status(204).end();
}
