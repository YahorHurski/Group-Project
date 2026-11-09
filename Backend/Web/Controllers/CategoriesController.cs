using Backend.Services.Catalog;
using Backend.Services.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Web.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(ICategoryService categories) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll() =>
        Ok(await categories.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var result = await categories.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : this.ToProblem(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(CategoryRequest request)
    {
        var result = await categories.CreateAsync(request);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value)
            : this.ToProblem(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryDto>> Update(int id, CategoryRequest request)
    {
        var result = await categories.UpdateAsync(id, request);
        return result.IsSuccess ? Ok(result.Value) : this.ToProblem(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await categories.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : this.ToProblem(result);
    }
}
