import { Router } from 'express';
import {
  createCategoryHandler,
  listCategoriesHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from './categories.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);

categoriesRouter.post('/', createCategoryHandler);
categoriesRouter.get('/', listCategoriesHandler);
categoriesRouter.put('/:id', updateCategoryHandler);
categoriesRouter.delete('/:id', deleteCategoryHandler);
