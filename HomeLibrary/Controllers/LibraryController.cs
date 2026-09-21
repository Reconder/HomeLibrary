using FluentValidation;
using FluentValidation.Results;
using HomeLibrary.DTOs.Book;
using HomeLibrary.Models;
using HomeLibrary.Services;
using Microsoft.AspNetCore.Mvc;

namespace HomeLibrary.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LibraryController : ControllerBase
{
    private readonly ILibraryService _libraryService;
    private IValidator<CreateBookRequest> _createValidator;
    private IValidator<UpdateBookRequest> _updateValidator;
    
    public LibraryController(ILibraryService libraryService,
        IValidator<CreateBookRequest> createValidator,
        IValidator<UpdateBookRequest> updateValidator)
    {
        _libraryService = libraryService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }
    [HttpPost("book")]
    public async Task<IActionResult> Create([FromBody] CreateBookRequest request, CancellationToken token)
    {
        ValidationResult validationResult = _createValidator.Validate(request);

        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }
        
        BookResponse result;
        try
        {
            result = await _libraryService.Create(request, token);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
            
        }
        return Ok(result);
    }
    [HttpGet("book/{id}")]
    public async Task<IActionResult> Get(string id, CancellationToken token)
    {
        BookResponse result;
        try
        {
            result = await _libraryService.Get(id, token);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
            
        }
        return Ok(result);
    }
    
    [HttpGet("book/page={page:int}&pageSize={pageSize:int}")]
    public async Task<IActionResult> GetAll(int page, int pageSize, CancellationToken token)
    {
        IEnumerable<BookResponse> result;
        try
        {
            result = await _libraryService.GetAll(page, pageSize, token);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
            
        }
        return Ok(result);
    }
    
    [HttpPatch("book")]
    public async Task<IActionResult> Update([FromBody] UpdateBookRequest request, CancellationToken token)
    {
        ValidationResult validationResult = _updateValidator.Validate(request);
        
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }
        
        BookResponse result;
        try
        {
            result = await _libraryService.Update(request, token);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
            
        }
        return Ok(result);
    }
    
    [HttpDelete("book/{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken token)
    {
        try
        {
            await _libraryService.Delete(id, token);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
            
        }
        return Ok(true);
    }
    
    [HttpGet("book/query={query}&page={page:int}&pageSize={pageSize:int}")]
    public async Task<IActionResult> Search(string query, int page, int pageSize, CancellationToken token)
    {
        try
        {
            var results = await _libraryService.Search(query, page, pageSize, token);
            return Ok(results);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
            
        }
        
    }
    
}