using System.Security.Claims;
using Backend.DAL;
using Backend.Services.Auth;
using Backend.Services.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Web.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, AppDbContext db) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var response = await authService.RegisterAsync(request);
        if (response is null)
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Email is already registered."
            });

        return CreatedAtAction(nameof(Me), response);
    }

    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var response = await authService.LoginAsync(request);
        if (response is null)
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid email or password."
            });

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType<UserDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Me()
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        if (user is null)
            return Unauthorized();

        return Ok(new UserDto(user.Id, user.Email, user.Role.ToString()));
    }
}
