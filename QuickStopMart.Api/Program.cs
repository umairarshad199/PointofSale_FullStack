using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using QuickStopMart.Api.Data;
using QuickStopMart.Api.Models;
using QuickStopMart.Api.Services;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// CONTROLLERS
// =====================================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            ReferenceHandler.IgnoreCycles;

        options.JsonSerializerOptions.WriteIndented = true;
    });

// =====================================================
// CORS - REACT FRONTEND
// =====================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// =====================================================
// SWAGGER
// =====================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "QuickStopMart API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter your JWT token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] =
                new List<string>()
        });
});

// =====================================================
// DATABASE - SQL SERVER
// =====================================================

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// =====================================================
// SERVICES
// =====================================================

builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ISaleService, SaleService>();
builder.Services.AddScoped<PasswordService>();

builder.Services.AddMemoryCache();

// =====================================================
// JWT AUTHENTICATION
// =====================================================

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    builder.Configuration["Jwt:Issuer"],

                ValidAudience =
                    builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration["Jwt:Key"]!))
            };
    });

// =====================================================
// AUTHORIZATION
// =====================================================

builder.Services.AddAuthorization();

var app = builder.Build();

// =====================================================
// DATABASE MIGRATION + SEED DATA
// =====================================================

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var dbContext =
        services.GetRequiredService<AppDbContext>();

    var passwordService =
        services.GetRequiredService<PasswordService>();

    // Apply EF Core migrations
    dbContext.Database.Migrate();

    // =================================================
    // SEED ADMIN USER
    // =================================================

    if (!dbContext.Users.Any(u => u.UserName == "admin"))
    {
        dbContext.Users.Add(new User
        {
            UserName = "admin",
            PasswordHash =
                passwordService.HashPassword("Admin@123"),
            Role = "Admin"
        });
    }

    // =================================================
    // SEED NORMAL USER
    // =================================================

    if (!dbContext.Users.Any(u => u.UserName == "user"))
    {
        dbContext.Users.Add(new User
        {
            UserName = "user",
            PasswordHash =
                passwordService.HashPassword("User@123"),
            Role = "User"
        });
    }

    // Save users
    dbContext.SaveChanges();

    // =================================================
    // SEED PRODUCTS
    // =================================================

    if (!dbContext.Products.Any())
    {
        dbContext.Products.AddRange(

            new Product
            {
                Name = "Milk",
                Price = 2.50m,
                Category = "Dairy",
                Quantity = 50
            },

            new Product
            {
                Name = "Bread",
                Price = 1.20m,
                Category = "Bakery",
                Quantity = 30
            },

            new Product
            {
                Name = "Eggs",
                Price = 3.00m,
                Category = "Dairy",
                Quantity = 60
            },

            new Product
            {
                Name = "Rice",
                Price = 5.00m,
                Category = "Grocery",
                Quantity = 40
            },

            new Product
            {
                Name = "Cooking Oil",
                Price = 7.50m,
                Category = "Grocery",
                Quantity = 25
            }
        );

        dbContext.SaveChanges();
    }
}

// =====================================================
// SWAGGER
// =====================================================

app.UseSwagger();
app.UseSwaggerUI();

// =====================================================
// HTTPS REDIRECTION
// =====================================================

// Disabled because the API is currently running on HTTP.
// app.UseHttpsRedirection();

// =====================================================
// CORS
// =====================================================

app.UseCors("ReactFrontend");

// =====================================================
// AUTHENTICATION & AUTHORIZATION
// =====================================================

app.UseAuthentication();
app.UseAuthorization();

// =====================================================
// CONTROLLERS
// =====================================================

app.MapControllers();

// =====================================================
// RUN APPLICATION
// =====================================================

app.Run();
