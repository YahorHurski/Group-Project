using Backend.Services.Catalog;
using Backend.Services.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Web.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(IProductService products) : ControllerBase
{
    /// <summary>Lists products. Optional filters: <c>search</c> (name/description) and <c>categoryId</c>.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetAll([FromQuery] string? search, [FromQuery] int? categoryId) =>
        Ok(await products.GetAllAsync(search, categoryId));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var result = await products.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : this.ToProblem(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(ProductRequest request)
    {
        var result = await products.CreateAsync(request);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value)
            : this.ToProblem(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> Update(int id, ProductRequest request)
    {
        var result = await products.UpdateAsync(id, request);
        return result.IsSuccess ? Ok(result.Value) : this.ToProblem(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await products.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : this.ToProblem(result);
    }
}
