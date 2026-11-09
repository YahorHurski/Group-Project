namespace Backend.Services.Common;

public enum ResultStatus
{
    Ok,
    NotFound,
    Conflict,
    Invalid
}

/// <summary>Outcome of a service operation, mapped to an HTTP status by the controllers.</summary>
public class Result<T>
{
    public ResultStatus Status { get; private init; }
    public T? Value { get; private init; }
    public string? Error { get; private init; }

    public bool IsSuccess => Status == ResultStatus.Ok;

    public static Result<T> Ok(T value) => new() { Status = ResultStatus.Ok, Value = value };
    public static Result<T> NotFound(string error) => new() { Status = ResultStatus.NotFound, Error = error };
    public static Result<T> Conflict(string error) => new() { Status = ResultStatus.Conflict, Error = error };
    public static Result<T> Invalid(string error) => new() { Status = ResultStatus.Invalid, Error = error };
}
