using Backend.DAL;
using Backend.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Auth;

public static class AdminSeeder
{
    /// <summary>
    /// Creates the initial administrator from the "SeedAdmin" configuration section
    /// (Email/Password) if configured and no user with that email exists yet.
    /// </summary>
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        var email = configuration["SeedAdmin:Email"]?.Trim().ToLowerInvariant();
        var password = configuration["SeedAdmin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return;

        var db = services.GetRequiredService<AppDbContext>();
        if (await db.Users.AnyAsync(u => u.Email == email))
            return;

        var hasher = services.GetRequiredService<IPasswordHasher<User>>();
        var admin = new User { Email = email, Role = Role.Admin, Cart = new Cart() };
        admin.PasswordHash = hasher.HashPassword(admin, password);

        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}
