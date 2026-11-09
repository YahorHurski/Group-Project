using Backend.Model;

namespace Backend.Services.Auth;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) Generate(User user);
}
