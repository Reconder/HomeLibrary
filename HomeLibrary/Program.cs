using System.Data;
using FluentValidation;
using HomeLibrary.DTOs.Book;
using HomeLibrary.Models;
using HomeLibrary.Repository;
using HomeLibrary.Services;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Data.SqlClient;
using Microsoft.OpenApi;
using Serilog;

namespace HomeLibrary;

public class Program
{
    public static void Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateLogger();
        var builder = WebApplication.CreateBuilder(args);
        
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();

        var cn = Environment.GetEnvironmentVariable("HomeLibraryConnectionString");
        string connectionString = String.IsNullOrEmpty(cn) ? builder.Configuration.GetConnectionString("HomeLibrary") : cn;

        builder.Services.AddScoped<IDbConnection>(sp => new SqlConnection(connectionString));
        builder.Services.AddScoped<ILibraryRepository, LibraryRepository>();
        builder.Services.AddScoped<ILibraryService, LibraryService>();
        builder.Services.AddScoped<IValidator<CreateBookRequest>, CreateBookRequestValidator>();
        builder.Services.AddScoped<IValidator<UpdateBookRequest>, UpdateBookRequestValidator>();
        builder.Services.AddHealthChecks()
            .AddSqlServer(connectionString);


        builder.Services.AddRateLimiter();
        
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });
        
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = builder.Configuration["ServiceName"], Version = "v1" });
        });
        

        
        var app = builder.Build();
        
        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseCors("AllowFrontend");
        app.UseHttpsRedirection();
        app.MapControllers();
        app.UseExceptionHandler("/error");
        

        app.UseAuthorization();
        
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = _ => true });


        app.Run();
    }
}
