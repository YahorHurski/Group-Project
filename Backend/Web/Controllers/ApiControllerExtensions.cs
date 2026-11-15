using Backend.Services.Common;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Web.Controllers;

public static class ApiControllerExtensions
{
    /// <summary>Maps a failed service <see cref="Result{T}"/> to a ProblemDetails response.</summary>
    public static ActionResult ToProblem<T>(this ControllerBase controller, Result<T> result)
    {
        var (status, title) = result.Status switch
        {
            ResultStatus.NotFound => (StatusCodes.Status404NotFound, "Not found"),
            ResultStatus.Conflict => (StatusCodes.Status409Conflict, "Conflict"),
            _ => (StatusCodes.Status400BadRequest, "Bad request")
        };

        return controller.StatusCode(status, new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = result.Error
        });
    }
}
