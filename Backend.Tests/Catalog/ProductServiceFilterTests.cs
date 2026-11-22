using Backend.Services.Common;
using Backend.Services.DTOs;

namespace Backend.Tests.Catalog;

/// <summary>
/// Tests of <c>ProductService.GetAllAsync</c> (search, category, price and stock filters)
/// against a real PostgreSQL database. See <see cref="PostgresCatalogFixture"/>.
/// </summary>
public class ProductServiceFilterTests : IClassFixture<PostgresCatalogFixture>
{
    private readonly PostgresCatalogFixture _fixture;

    public ProductServiceFilterTests(PostgresCatalogFixture fixture) => _fixture = fixture;

    private async Task<string[]> NamesAsync(
        string? search = null, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null, bool? inStock = null)
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        await using var db = _fixture.CreateContext();
        var products = await _fixture.CreateService(db).GetAllAsync(search, categoryId, minPrice, maxPrice, inStock);
        return products.Select(p => p.Name).ToArray();
    }

    [SkippableFact]
    public async Task NoFilters_ReturnsEverythingSortedByName()
    {
        var names = await NamesAsync();

        Assert.Equal(["C# in Depth", "Gaming Laptop", "Mouse", "Office Laptop", "Old Atlas"], names);
    }

    [SkippableFact]
    public async Task Search_IsCaseInsensitiveAndChecksNameAndDescription()
    {
        Assert.Equal(["Gaming Laptop", "Office Laptop"], await NamesAsync(search: "LAPTOP"));
        Assert.Equal(["C# in Depth"], await NamesAsync(search: "programming"));
    }

    [SkippableFact]
    public async Task Search_TreatsLikeWildcardsAsPlainText()
    {
        Assert.Equal(["Gaming Laptop"], await NamesAsync(search: "100%"));
        Assert.Equal(["Gaming Laptop"], await NamesAsync(search: "%")); // not "match everything"
        Assert.Empty(await NamesAsync(search: "_")); // not "any single character"
    }

    [SkippableFact]
    public async Task Category_RestrictsResults()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);
        await using var db = _fixture.CreateContext();
        var booksId = db.Categories.Single(c => c.Name == "Books").Id;

        Assert.Equal(["C# in Depth", "Old Atlas"], await NamesAsync(categoryId: booksId));
        Assert.Empty(await NamesAsync(categoryId: -1));
    }

    [SkippableFact]
    public async Task PriceRange_IsInclusive()
    {
        Assert.Equal(["C# in Depth", "Mouse"], await NamesAsync(maxPrice: 45.50m));
        Assert.Equal(["Gaming Laptop"], await NamesAsync(minPrice: 2000m));
        Assert.Equal(["Office Laptop", "Old Atlas"], await NamesAsync(minPrice: 120m, maxPrice: 800m));
    }

    [SkippableFact]
    public async Task InStock_True_HidesOutOfStockProducts()
    {
        Assert.Equal(["C# in Depth", "Gaming Laptop", "Mouse"], await NamesAsync(inStock: true));
    }

    [SkippableFact]
    public async Task InStock_FalseOrNull_DoesNotFilter()
    {
        Assert.Equal(5, (await NamesAsync(inStock: false)).Length);
        Assert.Equal(5, (await NamesAsync(inStock: null)).Length);
    }

    [SkippableFact]
    public async Task Filters_AreCombinedWithAnd()
    {
        var names = await NamesAsync(search: "laptop", maxPrice: 1000m, inStock: true);

        Assert.Empty(names); // the only cheap laptop is out of stock
        Assert.Equal(["Office Laptop"], await NamesAsync(search: "laptop", maxPrice: 1000m));
    }

    [SkippableFact]
    public async Task GetById_UnknownProduct_ReturnsNotFound()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);
        await using var db = _fixture.CreateContext();

        var result = await _fixture.CreateService(db).GetByIdAsync(-1);

        Assert.Equal(ResultStatus.NotFound, result.Status);
    }
}
