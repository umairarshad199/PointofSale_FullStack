using QuickStopMart.Api.Models;

namespace QuickStopMart.Api.Services;

public interface ISaleService
{
    void StartNewSale(string userId);

    Task AddItemAsync(string userId, int productId, int quantity);

    void RemoveItem(string userId, int productId);

    bool UndoLastAction(string userId);

    IEnumerable<CartItem> GetCart(string userId);

    decimal CalculateSubtotal(string userId);

    decimal CalculateTax(string userId);

    decimal CalculateGrandTotal(string userId);

    Task<string> CheckoutAsync(string userId);

    Task<string?> GetNextReceiptAsync(string userId);
}