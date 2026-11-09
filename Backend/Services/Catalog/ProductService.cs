using AutoMapper;
using Backend.DAL;
using Backend.Model;
using Backend.Services.Common;
using Backend.Services.DTOs;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Backend.Services.Catalog;

public class ProductService(AppDbContext db, IMapper mapper) : IProductService
{
    public async Task<IReadOnlyList<ProductDto>> GetAllAsync(string? search = null, int? categoryId = null)
    {
        var query = db.Products.AsNoTracking().Include(p => p.Category).AsQueryable();

        if (categoryId is not null)
            query = query.Where(p => p.CategoryId == categoryId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{EscapeLike(search.Trim())}%";
            query = query.Where(p =>
                EF.Functions.ILike(p.Name, pattern, "\\") ||
                (p.Description != null && EF.Functions.ILike(p.Description, pattern, "\\")));
        }

        var products = await query.OrderBy(p => p.Name).ThenBy(p => p.Id).ToListAsync();
        return mapper.Map<List<ProductDto>>(products);
    }

    public async Task<Result<ProductDto>> GetByIdAsync(int id)
    {
        var product = await db.Products.AsNoTracking().Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
        return product is null
            ? Result<ProductDto>.NotFound("Product not found.")
            : Result<ProductDto>.Ok(mapper.Map<ProductDto>(product));
    }

    public async Task<Result<ProductDto>> CreateAsync(ProductRequest request)
    {
        if (!await db.Categories.AnyAsync(c => c.Id == request.CategoryId))
            return Result<ProductDto>.Invalid("Category does not exist.");

        var product = mapper.Map<Product>(request);
        product.Name = product.Name.Trim();
        product.Description = NormalizeDescription(product.Description);

        db.Products.Add(product);
        await db.SaveChangesAsync();

        await db.Entry(product).Reference(p => p.Category).LoadAsync();
        return Result<ProductDto>.Ok(mapper.Map<ProductDto>(product));
    }

    public async Task<Result<ProductDto>> UpdateAsync(int id, ProductRequest request)
    {
        var product = await db.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            return Result<ProductDto>.NotFound("Product not found.");

        if (!await db.Categories.AnyAsync(c => c.Id == request.CategoryId))
            return Result<ProductDto>.Invalid("Category does not exist.");

        product.Name = request.Name.Trim();
        product.Description = NormalizeDescription(request.Description);
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.CategoryId = request.CategoryId;

        await db.SaveChangesAsync();

        await db.Entry(product).Reference(p => p.Category).LoadAsync();
        return Result<ProductDto>.Ok(mapper.Map<ProductDto>(product));
    }

    public async Task<Result<bool>> DeleteAsync(int id)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            return Result<bool>.NotFound("Product not found.");

        db.Products.Remove(product);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.ForeignKeyViolation })
        {
            // Product is referenced by existing orders (history must stay intact).
            return Result<bool>.Conflict("Product cannot be deleted because it is part of existing orders.");
        }

        return Result<bool>.Ok(true);
    }

    private static string? NormalizeDescription(string? description) =>
        string.IsNullOrWhiteSpace(description) ? null : description.Trim();

    private static string EscapeLike(string value) =>
        value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
