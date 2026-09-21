using HomeLibrary.DTOs.Book;
using HomeLibrary.Models;
using HomeLibrary.Repository;

namespace HomeLibrary.Services;

public class LibraryService : ILibraryService
{
    ILibraryRepository _libraryRepository;
    public LibraryService(ILibraryRepository libraryRepository)
    {
        _libraryRepository = libraryRepository;
    }
    public async Task<BookResponse> Create(CreateBookRequest book, CancellationToken token)
    {
        var b = new Book
        {
            Id = Guid.NewGuid().ToString(),
            Title = book.Title,
            Author = book.Author,
            PublishingYear = book.PublishingYear,
            TableOfContents = book.TableOfContents,
            Notes = book.Notes,
            IsDeleted =  false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        return MapBookToResponse(await _libraryRepository.CreateAsync(b, token), token);
    }

    public async Task<BookResponse> Get(string id, CancellationToken token)
    {
        return MapBookToResponse(await _libraryRepository.GetAsync(id, token), token);
    }

    public async Task<IEnumerable<BookResponse>> GetAll(int page, int pageSize, CancellationToken token)
    {
        return (await _libraryRepository.GetAllAsync(page, pageSize, token)).Select(x => MapBookToResponse(x, token));
    }

    public async Task<BookResponse> Update(UpdateBookRequest book, CancellationToken token)
    {
        var b = new Book
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            PublishingYear = book.PublishingYear,
            TableOfContents = book.TableOfContents,
            Notes = book.Notes,
            UpdatedAt = DateTime.UtcNow
        };
        return MapBookToResponse(await _libraryRepository.UpdateAsync(b, token), token);
    }

    public async Task Delete(string id, CancellationToken token)
    {
        await _libraryRepository.DeleteAsync(id, token);
    }

    public async Task<IEnumerable<BookResponse>> Search(string query, int page, int pageSize, CancellationToken token)
    {
        return (await _libraryRepository.SearchAsync(query, page, pageSize, token)).Select(x => MapBookToResponse(x, token));
    }

    public BookResponse MapBookToResponse(Book book, CancellationToken token) =>
        new BookResponse
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            PublishingYear =  book.PublishingYear,
            TableOfContents = book.TableOfContents,
            Notes = book.Notes,
        };
}