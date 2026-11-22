using Backend.Services.Common;
using Backend.Services.DTOs;

namespace Backend.Services.Catalog;

public interface IProductService
{
    /// <param name="search">Case-insensitive substring of the product name or description.</param>
    /// <param name="categoryId">Restrict results to one category.</param>
    /// <param name="minPrice">Inclusive lower price bound.</param>
    /// <param name="maxPrice">Inclusive upper price bound.</param>
    /// <param name="inStock">When true, only products with stock greater than zero.</param>
    Task<IReadOnlyList<ProductDto>> GetAllAsync(string? search = null, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null, bool? inStock = null);
    Task<Result<ProductDto>> GetByIdAsync(int id);
    Task<Result<ProductDto>> CreateAsync(ProductRequest request);
    Task<Result<ProductDto>> UpdateAsync(int id, ProductRequest request);
    Task<Result<bool>> DeleteAsync(int id);
}
