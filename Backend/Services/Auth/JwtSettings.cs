namespace Backend.Services.Auth;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "ShopApi";
    public string Audience { get; set; } = "ShopClient";
    public string Key { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 60;
}
