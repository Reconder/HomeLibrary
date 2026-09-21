using System.Data;
using Dapper;
using HomeLibrary.Models;

namespace HomeLibrary.Repository;

public class LibraryRepository : ILibraryRepository
{
    private readonly IDbConnection _dbConnection;
    
    public LibraryRepository(IDbConnection dbConnection) => _dbConnection = dbConnection;
    
    public async Task<Book> CreateAsync(Book book, CancellationToken token)
    {
        const string sql = @"EXEC dbo.InsertBook @Id, @Title, @Author, @PublishingYear, @TableOfContents, @Notes, @CreatedAt, @UpdatedAt, @IsDeleted";
        await _dbConnection.QueryAsync(sql, book);
        return book;
    }

    public async Task<Book> GetAsync(string id, CancellationToken token)
    {
        const string sql = "EXEC dbo.GetBook @Id";
        return await _dbConnection.QueryFirstOrDefaultAsync<Book>(sql, new { Id = id });
    }

    public async Task<IEnumerable<Book>> GetAllAsync(int page, int pageSize, CancellationToken token)
    {
        const string sql = "EXEC dbo.GetAllBooks @Offset, @PageSize";
        return await _dbConnection.QueryAsync<Book>(sql, new { Offset = (page - 1) * pageSize, PageSize = pageSize });
    }

    public async Task<Book> UpdateAsync(Book book, CancellationToken token)
    {
        const string sql = @"EXEC dbo.UpdateBook @Id, @Title, @Author, @PublishingYear, @TableOfContents, @Notes, @UpdatedAt ";
        await _dbConnection.QueryAsync(sql, book);
        return book;
    }

    public async Task DeleteAsync(string id, CancellationToken token)
    {
        const string sql = "EXEC dbo.DeleteBook @Id";
        await _dbConnection.QueryAsync(sql, new { Id = id });
    }

    public async Task<IEnumerable<Book>> SearchAsync(string query, int page, int pageSize, CancellationToken token)
    {
        var sql = @"EXEC dbo.SearchBooks @Query, @Offset, @PageSize";

        var parameters = new
        {
            Query = query,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        };
    
        return await _dbConnection.QueryAsync<Book>(sql, parameters);
    }
}