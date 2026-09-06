using QuickStopMart.Api.Models;

namespace QuickStopMart.Api.Services;

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllProductsAsync();

    Task<Product?> GetProductByIdAsync(int id);

    Task<Product> AddProductAsync(Product product);

    Task<Product?> UpdateProductAsync(int id, Product product);

    Task<bool> DeleteProductAsync(int id);

    Task<bool> ReduceStockAsync(int productId, int quantity);
}