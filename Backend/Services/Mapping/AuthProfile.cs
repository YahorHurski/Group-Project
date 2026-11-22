using AutoMapper;
using Backend.Model;
using Backend.Services.DTOs;

namespace Backend.Services.Mapping;

/// <summary>AutoMapper mappings for users: <see cref="User"/> to <see cref="UserDto"/> (the password hash is never exposed).</summary>
public class AuthProfile : Profile
{
    public AuthProfile()
    {
        CreateMap<User, UserDto>()
            .ForCtorParam(nameof(UserDto.Role), o => o.MapFrom(s => s.Role.ToString()));
    }
}
