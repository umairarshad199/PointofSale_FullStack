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
        return await _context.Products.ToListAsync();
    }

    // ==========================================
    // GET PRODUCT BY ID
    // ==========================================

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        return await _context.Products.FindAsync(id);
    }

    // ==========================================
    // ADD PRODUCT
    // ==========================================

    public async Task<Product> AddProductAsync(Product product)
    {
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
            await _context.Products.FindAsync(id);

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
            await _context.Products.FindAsync(id);

        if (product == null)
            return false;

        // Check whether this product has already
        // been used in any receipt/sale.
        var hasReceiptItems =
            await _context.ReceiptItems
                .AnyAsync(r => r.ProductId == id);

        // Do not delete products that are part
        // of existing sales records.
        if (hasReceiptItems)
            return false;

        _context.Products.Remove(product);

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
            await _context.Products.FindAsync(productId);

        if (product == null || product.Quantity < quantity)
            return false;

        product.Quantity -= quantity;

        await _context.SaveChangesAsync();

        return true;
    }
}