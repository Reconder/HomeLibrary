using System.Xml;

namespace HomeLibrary.DTOs.Book;

public class BookResponse
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public string PublishingYear { get; set; }
    public string TableOfContents { get; set; }
    public string Notes { get; set; }
}