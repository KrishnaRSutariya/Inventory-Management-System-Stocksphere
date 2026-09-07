import { Types } from 'mongoose';
import { CategoryModel } from './category.model';
import { ProductModel } from '../products/product.model';
import { CreateCategoryInput, UpdateCategoryInput, ICategory } from './category.types';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors/AppError';

export class CategoryService {
  public async getAllCategories() {
    const categoriesWithCount = await CategoryModel.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          productCount: { $size: '$products' }
        }
      },
      { $sort: { name: 1 } }
    ]);

    return categoriesWithCount;
  }

  public async getCategoryById(id: string): Promise<ICategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid category ID format: ${id}`);
    }

    const category = await CategoryModel.findById(id).populate('createdBy', 'name email');
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }

    return category;
  }

  public async createCategory(input: CreateCategoryInput): Promise<ICategory> {
    const existing = await CategoryModel.findOne({
      name: { $regex: new RegExp(`^${input.name.trim()}$`, 'i') }
    });

    if (existing) {
      throw new ConflictError(`Category '${input.name}' already exists`);
    }

    const category = await CategoryModel.create({
      name: input.name.trim(),
      description: input.description?.trim(),
      createdBy: new Types.ObjectId(input.userId)
    });

    return category;
  }

  public async updateCategory(id: string, input: UpdateCategoryInput): Promise<ICategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid category ID format: ${id}`);
    }

    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }

    if (input.name && input.name.toLowerCase() !== category.name.toLowerCase()) {
      const existing = await CategoryModel.findOne({
        name: { $regex: new RegExp(`^${input.name.trim()}$`, 'i') },
        _id: { $ne: id }
      });
      if (existing) {
        throw new ConflictError(`Category '${input.name}' already exists`);
      }
      category.name = input.name.trim();
    }

    if (input.description !== undefined) {
      category.description = input.description.trim();
    }

    await category.save();
    return category;
  }

  public async deleteCategory(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid category ID format: ${id}`);
    }

    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }

    // Check if products exist under this category
    const linkedProductsCount = await ProductModel.countDocuments({ category: id });
    if (linkedProductsCount > 0) {
      throw new BadRequestError(
        `Cannot delete category '${category.name}' because it contains ${linkedProductsCount} linked product(s). Please reassign or delete them first.`
      );
    }

    await CategoryModel.findByIdAndDelete(id);
  }
}

export const categoryService = new CategoryService();
