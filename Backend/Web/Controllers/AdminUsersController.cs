using AutoMapper;
using AutoMapper.QueryableExtensions;
using Backend.DAL;
using Backend.Services.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Web.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController(AppDbContext db, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await db.Users.AsNoTracking()
            .OrderBy(u => u.Id)
            .ProjectTo<UserDto>(mapper.ConfigurationProvider)
            .ToListAsync();

        return Ok(users);
    }
}
