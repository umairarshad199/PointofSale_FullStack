using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuickStopMart.Api.Data;
using QuickStopMart.Api.DTOs;
using QuickStopMart.Api.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace QuickStopMart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly PasswordService _passwordService;

    public AuthController(
        AppDbContext context,
        IConfiguration config,
        PasswordService passwordService)
    {
        _context = context;
        _config = config;
        _passwordService = passwordService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto login)
    {
        // Find user in the database
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserName == login.UserName);

        if (user == null)
            return Unauthorized("Invalid username or password.");

        // Verify password against stored hash
        bool passwordValid = _passwordService.VerifyPassword(
            login.Password,
            user.PasswordHash);

        if (!passwordValid)
            return Unauthorized("Invalid username or password.");

        // Create JWT
        var tokenHandler = new JwtSecurityTokenHandler();

        var key = Encoding.UTF8.GetBytes(
            _config["Jwt:Key"]!);

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new Claim(
                ClaimTypes.Name,
                user.UserName),

            new Claim(
                ClaimTypes.Role,
                user.Role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),

            Expires = DateTime.UtcNow.AddMinutes(
                double.Parse(_config["Jwt:ExpiryMinutes"]!)),

            Issuer = _config["Jwt:Issuer"],

            Audience = _config["Jwt:Audience"],

            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        var tokenString = tokenHandler.WriteToken(token);

        return Ok(new
        {
            Token = tokenString,
            UserId = user.Id,
            UserName = user.UserName,
            Role = user.Role
        });
    }
}