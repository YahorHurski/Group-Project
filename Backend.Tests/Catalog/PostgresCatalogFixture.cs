using AutoMapper;
using Backend.DAL;
using Backend.Model;
using Backend.Services.Catalog;
using Backend.Services.Mapping;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;

namespace Backend.Tests.Catalog;

/// <summary>
/// Creates a throw-away PostgreSQL database seeded with a small catalog.
/// <para>
/// <c>ProductService</c> relies on PostgreSQL-only features (<c>ILIKE</c>, numeric/check constraints),
/// so these tests need a real server: <c>docker compose up -d db</c>. Override the server with the
/// <c>TEST_DB_CONNECTION</c> environment variable. When no server is reachable the tests are skipped.
/// </para>
/// </summary>
public sealed class PostgresCatalogFixture : IAsyncLifetime
{
    private const string DefaultConnection =
        "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres;Timeout=3";

    private string? _testConnection;
    private NpgsqlConnectionStringBuilder? _admin;

    public bool Available { get; private set; }
    public string SkipReason { get; private set; } = "";

    public async Task InitializeAsync()
    {
        _admin = new NpgsqlConnectionStringBuilder(
            Environment.GetEnvironmentVariable("TEST_DB_CONNECTION") ?? DefaultConnection);

        var dbName = $"shop_tests_{Guid.NewGuid():N}";
        try
        {
            await using var admin = new NpgsqlConnection(_admin.ConnectionString);
            await admin.OpenAsync();
            await using var create = new NpgsqlCommand($"CREATE DATABASE \"{dbName}\"", admin);
            await create.ExecuteNonQueryAsync();
        }
        catch (Exception ex) when (ex is NpgsqlException or TimeoutException or InvalidOperationException)
        {
            SkipReason = $"PostgreSQL is not reachable ({ex.GetBaseException().Message}). " +
                         "Start it with `docker compose up -d db` or set TEST_DB_CONNECTION.";
            return;
        }

        _testConnection = new NpgsqlConnectionStringBuilder(_admin.ConnectionString) { Database = dbName }.ConnectionString;

        await using var db = CreateContext();
        await db.Database.MigrateAsync();

        var computers = new Category { Name = "Computers" };
        var books = new Category { Name = "Books" };
        db.Products.AddRange(
            new Product { Name = "Gaming Laptop", Description = "Fast 100% RGB machine", Price = 2000m, StockQuantity = 5, Category = computers },
            new Product { Name = "Office Laptop", Description = "Cheap and light", Price = 800m, StockQuantity = 0, Category = computers },
            new Product { Name = "Mouse", Description = null, Price = 25m, StockQuantity = 40, Category = computers },
            new Product { Name = "C# in Depth", Description = "Programming book", Price = 45.50m, StockQuantity = 3, Category = books },
            new Product { Name = "Old Atlas", Description = "Out of print", Price = 120m, StockQuantity = 0, Category = books });
        await db.SaveChangesAsync();

        Available = true;
    }

    public async Task DisposeAsync()
    {
        if (_testConnection is null || _admin is null)
            return;

        NpgsqlConnection.ClearAllPools();
        var dbName = new NpgsqlConnectionStringBuilder(_testConnection).Database;
        await using var admin = new NpgsqlConnection(_admin.ConnectionString);
        await admin.OpenAsync();
        await using var drop = new NpgsqlCommand($"DROP DATABASE IF EXISTS \"{dbName}\" WITH (FORCE)", admin);
        await drop.ExecuteNonQueryAsync();
    }

    public AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(_testConnection).Options);

    public IMapper CreateMapper() =>
        new MapperConfiguration(cfg => cfg.AddProfile<CatalogProfile>(), NullLoggerFactory.Instance).CreateMapper();

    public ProductService CreateService(AppDbContext db) => new(db, CreateMapper());
}
