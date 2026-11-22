using Backend.DAL;
using Backend.Model;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Catalog;

/// <summary>
/// Seeds sample Polish categories and products when the catalog tables are empty.
/// </summary>
public static class CatalogSeeder
{
    /// <summary>
    /// Inserts initial categories and products if the database does not contain any yet.
    /// </summary>
    /// <param name="services">Scoped service provider used to resolve <see cref="AppDbContext"/>.</param>
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();
        if (await db.Categories.AnyAsync() || await db.Products.AnyAsync())
            return;

        var electronics = new Category { Name = "Elektronika" };
        var books = new Category { Name = "Książki" };
        var home = new Category { Name = "Dom i ogród" };
        var sport = new Category { Name = "Sport i rekreacja" };

        db.Categories.AddRange(electronics, books, home, sport);

        db.Products.AddRange(
            new Product
            {
                Name = "Laptop biurowy ProBook 15",
                Description = "Lekki laptop z ekranem 15,6 cala, 16 GB RAM i dyskiem SSD 512 GB.",
                Price = 3299.00m,
                StockQuantity = 8,
                Category = electronics
            },
            new Product
            {
                Name = "Słuchawki bezprzewodowe SoundMax",
                Description = "Wygodne słuchawki nauszne z aktywną redukcją szumów (ANC) i Bluetooth 5.3.",
                Price = 449.99m,
                StockQuantity = 15,
                Category = electronics
            },
            new Product
            {
                Name = "Mysz bezprzewodowa ErgoClick",
                Description = "Ergonomiczna mysz optyczna z cichymi przyciskami do pracy biurowej.",
                Price = 89.00m,
                StockQuantity = 32,
                Category = electronics
            },
            new Product
            {
                Name = "Monitor 27\" IPS QHD",
                Description = "Monitor biurowy o rozdzielczości 2560x1440 z regulacją wysokości.",
                Price = 1199.00m,
                StockQuantity = 0,
                Category = electronics
            },
            new Product
            {
                Name = "Czysty kod. Podręcznik dobrego programisty",
                Description = "Praktyczne zasady tworzenia czytelnego i łatwego w utrzymaniu oprogramowania.",
                Price = 79.90m,
                StockQuantity = 12,
                Category = books
            },
            new Product
            {
                Name = "Podstawy baz danych PostgreSQL",
                Description = "Kompletny przewodnik po projektowaniu relacyjnych baz danych i zapytań SQL.",
                Price = 64.50m,
                StockQuantity = 7,
                Category = books
            },
            new Product
            {
                Name = "Algorytmy. Ilustrowany przewodnik",
                Description = "Przystępne wprowadzenie do struktur danych oraz klasycznych algorytmów.",
                Price = 59.00m,
                StockQuantity = 0,
                Category = books
            },
            new Product
            {
                Name = "Ekspres ciśnieniowy AromaBar",
                Description = "Automatyczny ekspres do kawy z młynkiem żarnowym i spieniaczem mleka.",
                Price = 1899.00m,
                StockQuantity = 4,
                Category = home
            },
            new Product
            {
                Name = "Lampka biurkowa LED",
                Description = "Nowoczesna lampka z regulacją barwy światła i ładowarką indukcyjną.",
                Price = 129.00m,
                StockQuantity = 20,
                Category = home
            },
            new Product
            {
                Name = "Zestaw doniczek ceramicznych (3 szt.)",
                Description = "Minimalistyczne białe doniczki z podstawkami do roślin domowych.",
                Price = 74.00m,
                StockQuantity = 14,
                Category = home
            },
            new Product
            {
                Name = "Mata do ćwiczeń antypoślizgowa",
                Description = "Gruba mata treningowa 10 mm do jogi, stretchingu i ćwiczeń w domu.",
                Price = 69.99m,
                StockQuantity = 25,
                Category = sport
            },
            new Product
            {
                Name = "Plecak trekkingowy 35L",
                Description = "Wodoodporny plecak górski z wentylowanym stelażem i pokrowcem przeciwdeszczowym.",
                Price = 289.00m,
                StockQuantity = 0,
                Category = sport
            }
        );

        await db.SaveChangesAsync();
    }
}
