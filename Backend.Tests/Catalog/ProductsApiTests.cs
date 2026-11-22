using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Backend.Services.Catalog;
using Backend.Services.Common;
using Backend.Services.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Backend.Tests.Catalog;

/// <summary>
/// HTTP-level tests of <c>GET /api/products</c>: query binding and validation of the
/// catalog filters. The product service is replaced by a fake, so no database is needed.
/// </summary>
public class ProductsApiTests : IClassFixture<ProductsApiTests.ApiFactory>
{
    private readonly ApiFactory _factory;

    public ProductsApiTests(ApiFactory factory) => _factory = factory;

    [Fact]
    public async Task GetProducts_WithoutFilters_PassesNullsToService()
    {
        var (client, service) = _factory.CreateClientWithFake();

        var response = await client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var call = Assert.Single(service.Calls);
        Assert.Equal(new ProductQuery(null, null, null, null, null), call);
    }

    [Fact]
    public async Task GetProducts_WithAllFilters_PassesThemToService()
    {
        var (client, service) = _factory.CreateClientWithFake();

        var response = await client.GetAsync(
            "/api/products?search=laptop&categoryId=3&minPrice=10.5&maxPrice=999&inStock=true");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var call = Assert.Single(service.Calls);
        Assert.Equal(new ProductQuery("laptop", 3, 10.5m, 999m, true), call);
    }

    [Fact]
    public async Task GetProducts_ReturnsProductsFromService()
    {
        var (client, service) = _factory.CreateClientWithFake();
        service.Result = [new ProductDto(1, "Laptop", null, 1999.99m, 5, 3, "Computers")];

        var products = await client.GetFromJsonAsync<List<ProductDto>>(
            "/api/products", new JsonSerializerOptions(JsonSerializerDefaults.Web));

        var product = Assert.Single(products!);
        Assert.Equal("Laptop", product.Name);
        Assert.Equal("Computers", product.CategoryName);
    }

    [Fact]
    public async Task GetProducts_WhenMinEqualsMax_IsAccepted()
    {
        var (client, service) = _factory.CreateClientWithFake();

        var response = await client.GetAsync("/api/products?minPrice=50&maxPrice=50");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Single(service.Calls);
    }

    [Theory]
    [InlineData("minPrice=-1", "minPrice")]
    [InlineData("maxPrice=-0.01", "maxPrice")]
    [InlineData("minPrice=100&maxPrice=10", "minPrice")]
    public async Task GetProducts_WithInvalidPriceRange_Returns400AndSkipsService(string query, string errorField)
    {
        var (client, service) = _factory.CreateClientWithFake();

        var response = await client.GetAsync($"/api/products?{query}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.True(body.RootElement.GetProperty("errors").TryGetProperty(errorField, out _));
        Assert.Empty(service.Calls);
    }

    [Theory]
    [InlineData("minPrice=abc")]
    [InlineData("inStock=maybe")]
    [InlineData("categoryId=x")]
    public async Task GetProducts_WithMalformedParameter_Returns400(string query)
    {
        var (client, service) = _factory.CreateClientWithFake();

        var response = await client.GetAsync($"/api/products?{query}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(service.Calls);
    }

    [Fact]
    public async Task CreateProduct_WithoutToken_Returns401()
    {
        var (client, _) = _factory.CreateClientWithFake();

        var response = await client.PostAsJsonAsync("/api/products", new ProductRequest
        {
            Name = "Mouse",
            Price = 10,
            StockQuantity = 1,
            CategoryId = 1
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>The arguments the controller passed to <see cref="IProductService.GetAllAsync"/>.</summary>
    public sealed record ProductQuery(string? Search, int? CategoryId, decimal? MinPrice, decimal? MaxPrice, bool? InStock);

    /// <summary>Records catalog queries instead of touching a database.</summary>
    public sealed class FakeProductService : IProductService
    {
        public List<ProductQuery> Calls { get; } = [];
        public IReadOnlyList<ProductDto> Result { get; set; } = [];

        public Task<IReadOnlyList<ProductDto>> GetAllAsync(
            string? search = null, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null, bool? inStock = null)
        {
            Calls.Add(new ProductQuery(search, categoryId, minPrice, maxPrice, inStock));
            return Task.FromResult(Result);
        }

        public Task<Result<ProductDto>> GetByIdAsync(int id) => throw new NotSupportedException();
        public Task<Result<ProductDto>> CreateAsync(ProductRequest request) => throw new NotSupportedException();
        public Task<Result<ProductDto>> UpdateAsync(int id, ProductRequest request) => throw new NotSupportedException();
        public Task<Result<bool>> DeleteAsync(int id) => throw new NotSupportedException();
    }

    /// <summary>Hosts the real API pipeline without a database (migrations are disabled).</summary>
    public sealed class ApiFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseSetting("Database:MigrateOnStartup", "false");
            builder.UseSetting("Jwt:Key", "integration-tests-secret-key-0123456789-abcdef");
        }

        public (HttpClient Client, FakeProductService Service) CreateClientWithFake()
        {
            var service = new FakeProductService();
            var client = WithWebHostBuilder(b => b.ConfigureTestServices(services =>
            {
                services.RemoveAll<IProductService>();
                services.AddSingleton<IProductService>(service);
            })).CreateClient();
            return (client, service);
        }
    }
}
