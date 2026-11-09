using Backend.Services.Common;
using Backend.Services.DTOs;

namespace Backend.Services.Catalog;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync();
    Task<Result<CategoryDto>> GetByIdAsync(int id);
    Task<Result<CategoryDto>> CreateAsync(CategoryRequest request);
    Task<Result<CategoryDto>> UpdateAsync(int id, CategoryRequest request);
    Task<Result<bool>> DeleteAsync(int id);
}
