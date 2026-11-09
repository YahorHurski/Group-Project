using Backend.Services.DTOs;

namespace Backend.Services.Auth;

public interface IAuthService
{
    /// <summary>Registers a new user with the User role. Returns null if the email is already taken.</summary>
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);

    /// <summary>Returns null when the credentials are invalid.</summary>
    Task<AuthResponse?> LoginAsync(LoginRequest request);
}
