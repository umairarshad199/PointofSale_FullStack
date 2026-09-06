using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickStopMart.Api.DTOs;
using QuickStopMart.Api.Models;
using QuickStopMart.Api.Services;

namespace QuickStopMart.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    // ==========================================
    // GET - Admin + User
    // ==========================================

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _productService.GetAllProductsAsync();

        var dtos = products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            Category = p.Category,
            Quantity = p.Quantity
        });

        return Ok(dtos);
    }

    // ==========================================
    // POST - Admin only
    // ==========================================

[Authorize(Roles = "Admin")]
[HttpPost]
public async Task<IActionResult> Add(
    [FromBody] CreateProductDto dto)
{
    var product = new Product
    {
        Name = dto.Name,
        Price = dto.Price,
        Category = dto.Category,
        Quantity = dto.Quantity
    };

    var created = await _productService.AddProductAsync(product);

    return CreatedAtAction(
        nameof(GetAll),
        new { id = created.Id },
        created);
}

    // ==========================================
    // PUT - Admin only
    // ==========================================

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            Category = dto.Category,
            Quantity = dto.Quantity
        };

        var updated = await _productService.UpdateProductAsync(
            id,
            product);

        if (updated == null)
            return NotFound("Product not found.");

        return Ok(updated);
    }

    // ==========================================
    // DELETE - Admin only
    // ==========================================

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _productService.DeleteProductAsync(id);

        if (!deleted)
            return NotFound("Product not found.");

        return Ok("Product deleted successfully.");
    }
}