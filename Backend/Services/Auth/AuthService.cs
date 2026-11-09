using Backend.DAL;
using Backend.Model;
using Backend.Services.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Backend.Services.Auth;

public class AuthService(
    AppDbContext db,
    IPasswordHasher<User> passwordHasher,
    IJwtTokenGenerator tokenGenerator) : IAuthService
{
    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        var email = Normalize(request.Email);

        if (await db.Users.AnyAsync(u => u.Email == email))
            return null;

        var user = new User { Email = email, Role = Role.User };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        user.Cart = new Cart();

        db.Users.Add(user);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // Concurrent registration with the same email.
            return null;
        }

        return BuildResponse(user);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var email = Normalize(request.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
            return null;

        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
            return null;

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
            await db.SaveChangesAsync();
        }

        return BuildResponse(user);
    }

    private AuthResponse BuildResponse(User user)
    {
        var (token, expiresAt) = tokenGenerator.Generate(user);
        return new AuthResponse(token, expiresAt, new UserDto(user.Id, user.Email, user.Role.ToString()));
    }

    private static string Normalize(string email) => email.Trim().ToLowerInvariant();
}
