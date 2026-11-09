using AutoMapper;
using Backend.DAL;
using Backend.Model;
using Backend.Services.Common;
using Backend.Services.DTOs;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Backend.Services.Catalog;

public class CategoryService(AppDbContext db, IMapper mapper) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync()
    {
        var categories = await db.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync();
        return mapper.Map<List<CategoryDto>>(categories);
    }

    public async Task<Result<CategoryDto>> GetByIdAsync(int id)
    {
        var category = await db.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        return category is null
            ? Result<CategoryDto>.NotFound("Category not found.")
            : Result<CategoryDto>.Ok(mapper.Map<CategoryDto>(category));
    }

    public async Task<Result<CategoryDto>> CreateAsync(CategoryRequest request)
    {
        var name = request.Name.Trim();
        if (name.Length == 0)
            return Result<CategoryDto>.Invalid("Category name must not be empty.");
        if (await db.Categories.AnyAsync(c => c.Name == name))
            return Result<CategoryDto>.Conflict("A category with this name already exists.");

        var category = new Category { Name = name };
        db.Categories.Add(category);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            return Result<CategoryDto>.Conflict("A category with this name already exists.");
        }

        return Result<CategoryDto>.Ok(mapper.Map<CategoryDto>(category));
    }

    public async Task<Result<CategoryDto>> UpdateAsync(int id, CategoryRequest request)
    {
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
            return Result<CategoryDto>.NotFound("Category not found.");

        var name = request.Name.Trim();
        if (name.Length == 0)
            return Result<CategoryDto>.Invalid("Category name must not be empty.");
        if (await db.Categories.AnyAsync(c => c.Name == name && c.Id != id))
            return Result<CategoryDto>.Conflict("A category with this name already exists.");

        category.Name = name;
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            return Result<CategoryDto>.Conflict("A category with this name already exists.");
        }

        return Result<CategoryDto>.Ok(mapper.Map<CategoryDto>(category));
    }

    public async Task<Result<bool>> DeleteAsync(int id)
    {
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
            return Result<bool>.NotFound("Category not found.");

        if (await db.Products.AnyAsync(p => p.CategoryId == id))
            return Result<bool>.Conflict("Category cannot be deleted because it still contains products.");

        db.Categories.Remove(category);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.ForeignKeyViolation })
        {
            return Result<bool>.Conflict("Category cannot be deleted because it is still in use.");
        }

        return Result<bool>.Ok(true);
    }

    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
}
