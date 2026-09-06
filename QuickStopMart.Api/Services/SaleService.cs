using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using QuickStopMart.Api.Data;
using QuickStopMart.Api.Models;
using System.Text;

namespace QuickStopMart.Api.Services;

public class SaleService : ISaleService
{
    private readonly IProductService _productService;
    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;

    private readonly string _cartCachePrefix = "Cart_";
    private readonly string _undoCachePrefix = "Undo_";
    private readonly string _receiptQueuePrefix = "ReceiptQueue_";

    private readonly decimal[] _taxThresholds =
        { 0m, 100m, 200m, 500m };

    private readonly decimal[] _taxRates =
        { 0.05m, 0.08m, 0.10m, 0.12m };

    public SaleService(
        IProductService productService,
        AppDbContext context,
        IMemoryCache cache)
    {
        _productService = productService;
        _context = context;
        _cache = cache;
    }

    private List<CartItem> GetCartInternal(string userId)
    {
        return _cache.GetOrCreate(
            _cartCachePrefix + userId,
            entry =>
            {
                entry.SlidingExpiration =
                    TimeSpan.FromMinutes(30);

                return new List<CartItem>();
            })!;
    }

    private void SaveCart(
        string userId,
        List<CartItem> cart)
    {
        _cache.Set(
            _cartCachePrefix + userId,
            cart);
    }

    private Stack<Action> GetUndoStack(string userId)
    {
        return _cache.GetOrCreate(
            _undoCachePrefix + userId,
            entry =>
            {
                entry.SlidingExpiration =
                    TimeSpan.FromMinutes(30);

                return new Stack<Action>();
            })!;
    }

    private void SaveUndoStack(
        string userId,
        Stack<Action> undoStack)
    {
        _cache.Set(
            _undoCachePrefix + userId,
            undoStack);
    }

    private Queue<string> GetReceiptQueue(string userId)
    {
        return _cache.GetOrCreate(
            _receiptQueuePrefix + userId,
            entry =>
            {
                entry.SlidingExpiration =
                    TimeSpan.FromMinutes(30);

                return new Queue<string>();
            })!;
    }

    private void SaveReceiptQueue(
        string userId,
        Queue<string> queue)
    {
        _cache.Set(
            _receiptQueuePrefix + userId,
            queue);
    }

    public void StartNewSale(string userId)
    {
        _cache.Remove(
            _cartCachePrefix + userId);

        _cache.Remove(
            _undoCachePrefix + userId);
    }

    public async Task AddItemAsync(
        string userId,
        int productId,
        int quantity)
    {
        var product =
            await _productService.GetProductByIdAsync(productId);

        if (product == null)
            throw new ArgumentException(
                "Product not found");

        if (quantity <= 0)
            throw new ArgumentException(
                "Quantity must be greater than zero.");

        if (product.Quantity < quantity)
            throw new InvalidOperationException(
                $"Insufficient stock. Only {product.Quantity} available.");

        var cart = GetCartInternal(userId);

        var existing = cart.FirstOrDefault(
            c => c.Product.Id == productId);

        var undoStack = GetUndoStack(userId);

        if (existing != null)
        {
            undoStack.Push(() =>
            {
                existing.Quantity -= quantity;

                if (existing.Quantity <= 0)
                    cart.Remove(existing);
            });

            existing.Quantity += quantity;
        }
        else
        {
            var newItem = new CartItem
            {
                Product = product,
                Quantity = quantity
            };

            cart.Add(newItem);

            undoStack.Push(
                () => cart.Remove(newItem));
        }

        SaveCart(userId, cart);
        SaveUndoStack(userId, undoStack);
    }

    public void RemoveItem(
        string userId,
        int productId)
    {
        var cart = GetCartInternal(userId);

        var item = cart.FirstOrDefault(
            c => c.Product.Id == productId);

        if (item == null)
            throw new ArgumentException(
                "Item not found in cart");

        cart.Remove(item);

        SaveCart(userId, cart);
    }

    public bool UndoLastAction(string userId)
    {
        var undoStack = GetUndoStack(userId);

        if (undoStack.Count == 0)
            return false;

        undoStack.Pop()();

        SaveUndoStack(
            userId,
            undoStack);

        return true;
    }

    public IEnumerable<CartItem> GetCart(
        string userId)
    {
        return GetCartInternal(userId);
    }

    public decimal CalculateSubtotal(
        string userId)
    {
        var cart = GetCartInternal(userId);

        decimal total = 0m;

        foreach (var item in cart)
            total += item.LineTotal;

        return total;
    }

    public decimal CalculateTax(
        string userId)
    {
        decimal subtotal =
            CalculateSubtotal(userId);

        decimal rate = _taxRates[0];

        for (int i = 0;
             i < _taxThresholds.Length;
             i++)
        {
            if (subtotal >= _taxThresholds[i])
                rate = _taxRates[i];
            else
                break;
        }

        return subtotal * rate;
    }

    public decimal CalculateGrandTotal(
        string userId)
    {
        return CalculateSubtotal(userId)
             + CalculateTax(userId);
    }

    public async Task<string> CheckoutAsync(
        string userId)
    {
        var cart = GetCartInternal(userId);

        if (cart.Count == 0)
            throw new InvalidOperationException(
                "Cart is empty");

        if (!int.TryParse(userId, out int userIdInt))
            throw new InvalidOperationException(
                "Invalid user ID.");

        // =====================================================
        // CALCULATE TOTALS
        // =====================================================

        decimal sub =
            CalculateSubtotal(userId);

        decimal tax =
            CalculateTax(userId);

        decimal total =
            sub + tax;


        // =====================================================
        // DATABASE TRANSACTION
        // =====================================================

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // =================================================
            // REDUCE STOCK
            // =================================================

            foreach (var item in cart)
            {
                bool success =
                    await _productService.ReduceStockAsync(
                        item.Product.Id,
                        item.Quantity);

                if (!success)
                {
                    throw new InvalidOperationException(
                        $"Failed to reduce stock for {item.Product.Name}.");
                }
            }


            // =================================================
            // BUILD RECEIPT CONTENT
            // =================================================

            var sb = new StringBuilder();

            sb.AppendLine("===== RECEIPT =====");
            sb.AppendLine("QuickStop Mart");
            sb.AppendLine("-------------------");

            foreach (var item in cart)
            {
                sb.AppendLine(
                    $"{item.Product.Name} x {item.Quantity} @ {item.Product.Price:C} = {item.LineTotal:C}");
            }

            sb.AppendLine("-------------------");

            sb.AppendLine(
                $"Subtotal: {sub:C}");

            sb.AppendLine(
                $"Tax: {tax:C}");

            sb.AppendLine(
                $"Grand Total: {total:C}");

            sb.AppendLine(
                "Thank you for shopping!");

            sb.AppendLine(
                "===================");

            string receiptContent =
                sb.ToString();


            // =================================================
            // CREATE RECEIPT
            // =================================================

            var receipt = new Receipt
            {
                UserId = userIdInt,

                Content = receiptContent,

                CreatedAt = DateTime.UtcNow,

                IsProcessed = true,

                Subtotal = sub,

                Tax = tax,

                GrandTotal = total,

                HiddenFromAdmin = false
            };

            _context.Receipts.Add(receipt);

            await _context.SaveChangesAsync();


            // =================================================
            // CREATE RECEIPT ITEMS
            // =================================================

            foreach (var item in cart)
            {
                var receiptItem = new ReceiptItem
                {
                    ReceiptId = receipt.Id,

                    ProductId = item.Product.Id,

                    Quantity = item.Quantity,

                    UnitPrice = item.Product.Price,

                    Total = item.LineTotal
                };

                _context.ReceiptItems.Add(receiptItem);
            }

            await _context.SaveChangesAsync();


            // =================================================
            // COMMIT TRANSACTION
            // =================================================

            await transaction.CommitAsync();


            // =================================================
            // CLEAR CART AND UNDO HISTORY
            // =================================================

            _cache.Remove(
                _cartCachePrefix + userId);

            _cache.Remove(
                _undoCachePrefix + userId);


            return receiptContent;
        }
        catch
        {
            await transaction.RollbackAsync();

            throw;
        }
    }

    public async Task<string?> GetNextReceiptAsync(
        string userId)
    {
        if (!int.TryParse(userId, out int userIdInt))
            throw new InvalidOperationException(
                "Invalid user ID.");

        var queue =
            GetReceiptQueue(userId);

        if (queue.Count > 0)
        {
            string content =
                queue.Dequeue();

            SaveReceiptQueue(
                userId,
                queue);

            return content;
        }

        var dbReceipt =
            await _context.Receipts
                .Where(r =>
                    r.UserId == userIdInt &&
                    !r.IsProcessed)
                .OrderBy(r => r.CreatedAt)
                .FirstOrDefaultAsync();

        if (dbReceipt != null)
        {
            dbReceipt.IsProcessed = true;

            await _context.SaveChangesAsync();

            return dbReceipt.Content;
        }

        return null;
    }
}