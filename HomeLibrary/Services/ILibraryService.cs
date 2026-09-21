using HomeLibrary.DTOs.Book;
using HomeLibrary.Models;

namespace HomeLibrary.Services;

public interface ILibraryService
{
    public Task<BookResponse> Create(CreateBookRequest book, CancellationToken token);
    public Task<BookResponse> Get(string id, CancellationToken token);
    public Task<IEnumerable<BookResponse>> GetAll(int page, int pageSize, CancellationToken token);
    public Task<BookResponse> Update(UpdateBookRequest book, CancellationToken token);
    public Task Delete(string id, CancellationToken token);
    public Task<IEnumerable<BookResponse>> Search(string query, int page, int pageSize, CancellationToken token);
}