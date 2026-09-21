using HomeLibrary.Models;

namespace HomeLibrary.Repository;

public interface ILibraryRepository
{
    public Task<Book> CreateAsync(Book book, CancellationToken token);
    public Task<Book> GetAsync(string id, CancellationToken token);
    public Task<IEnumerable<Book>> GetAllAsync(int page, int pageSize, CancellationToken token);
    public Task<Book> UpdateAsync(Book book, CancellationToken token);
    public Task DeleteAsync(string id, CancellationToken token);
    public Task<IEnumerable<Book>> SearchAsync(string query, int page, int pageSize, CancellationToken token);
}