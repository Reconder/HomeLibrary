using System.Xml;
using FluentValidation;

namespace HomeLibrary.DTOs.Book;

public class UpdateBookRequest
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public string PublishingYear { get; set; }
    public string TableOfContents { get; set; }
    public string Notes { get; set; }
}

public class UpdateBookRequestValidator : AbstractValidator<UpdateBookRequest>
{
    public UpdateBookRequestValidator()
    {
        RuleFor(book => book.Id).NotNull().WithMessage("Id cannot be null");
        RuleFor(book => book.Title).NotNull().NotEmpty().WithMessage("Title is required");
        RuleFor(book => book.Author).NotNull().NotEmpty().WithMessage("Author is required");
        RuleFor(book => book.PublishingYear).NotEmpty().WithMessage("Publishing Year cannot be empty if provided");
        RuleFor(book => book.TableOfContents).NotEmpty().WithMessage("Table Of Contents cannot be empty if provided");
    }
}