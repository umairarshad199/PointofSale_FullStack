using Microsoft.EntityFrameworkCore;
using QuickStopMart.Api.Data;
using QuickStopMart.Api.Models;

namespace QuickStopMart.Api.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    // ==========================================
    // GET ALL PRODUCTS
    // ==========================================

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        return await _context.Products
            .Where(p => !p.IsDeleted)
            .ToListAsync();
    }

    // ==========================================
    // GET PRODUCT BY ID
    // ==========================================

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        return await _context.Products
            .FirstOrDefaultAsync(p =>
                p.Id == id &&
                !p.IsDeleted);
    }

    // ==========================================
    // ADD PRODUCT
    // ==========================================

    public async Task<Product> AddProductAsync(Product product)
    {
        product.IsDeleted = false;

        _context.Products.Add(product);

        await _context.SaveChangesAsync();

        return product;
    }

    // ==========================================
    // UPDATE PRODUCT
    // ==========================================

    public async Task<Product?> UpdateProductAsync(
        int id,
        Product product)
    {
        var existingProduct =
            await _context.Products
                .FirstOrDefaultAsync(p =>
                    p.Id == id &&
                    !p.IsDeleted);

        if (existingProduct == null)
            return null;

        existingProduct.Name = product.Name;
        existingProduct.Price = product.Price;
        existingProduct.Category = product.Category;
        existingProduct.Quantity = product.Quantity;

        await _context.SaveChangesAsync();

        return existingProduct;
    }

    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product =
            await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return false;

        // Soft delete:
        // Do NOT physically remove the product.
        // This keeps existing ReceiptItems intact.
        product.IsDeleted = true;

        await _context.SaveChangesAsync();

        return true;
    }

    // ==========================================
    // REDUCE STOCK
    // ==========================================

    public async Task<bool> ReduceStockAsync(
        int productId,
        int quantity)
    {
        var product =
            await _context.Products
                .FirstOrDefaultAsync(p =>
                    p.Id == productId &&
                    !p.IsDeleted);

        if (product == null || product.Quantity < quantity)
            return false;

        product.Quantity -= quantity;

        await _context.SaveChangesAsync();

        return true;
    }
}