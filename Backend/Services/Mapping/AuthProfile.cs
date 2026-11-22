using AutoMapper;
using Backend.Model;
using Backend.Services.DTOs;

namespace Backend.Services.Mapping;

public class AuthProfile : Profile
{
    public AuthProfile()
    {
        CreateMap<User, UserDto>()
            .ForCtorParam(nameof(UserDto.Role), o => o.MapFrom(s => s.Role.ToString()));
    }
}
