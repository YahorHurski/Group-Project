using Backend.Services.Common;
using Backend.Services.DTOs;

namespace Backend.Services.Catalog;

public interface IProductService
{
    /// <param name="search">Case-insensitive substring of the product name or description.</param>
    /// <param name="categoryId">Restrict results to one category.</param>
    Task<IReadOnlyList<ProductDto>> GetAllAsync(string? search = null, int? categoryId = null);
    Task<Result<ProductDto>> GetByIdAsync(int id);
    Task<Result<ProductDto>> CreateAsync(ProductRequest request);
    Task<Result<ProductDto>> UpdateAsync(int id, ProductRequest request);
    Task<Result<bool>> DeleteAsync(int id);
}
