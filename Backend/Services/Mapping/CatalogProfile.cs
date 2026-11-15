using AutoMapper;
using Backend.Model;
using Backend.Services.DTOs;

namespace Backend.Services.Mapping;

public class CatalogProfile : Profile
{
    public CatalogProfile()
    {
        CreateMap<Category, CategoryDto>();
        CreateMap<CategoryRequest, Category>();

        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty));
        CreateMap<ProductRequest, Product>();
    }
}
