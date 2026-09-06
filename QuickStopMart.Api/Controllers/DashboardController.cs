using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickStopMart.Api.Data;
using System.Security.Claims;

namespace QuickStopMart.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }


    // =====================================================
    // ADMIN DASHBOARD
    // =====================================================

    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public async Task<IActionResult> GetAdminDashboard()
    {
        // =================================================
        // TOTAL PRODUCTS
        // Only active products are counted
        // =================================================

        var totalProducts =
            await _context.Products
                .CountAsync(p => !p.IsDeleted);


        // =================================================
        // TOTAL INVENTORY UNITS
        // Only active products are counted
        // =================================================

        var totalInventoryUnits =
            await _context.Products
                .Where(p => !p.IsDeleted)
                .Select(p => (int?)p.Quantity)
                .SumAsync() ?? 0;


        // =================================================
        // PROCESSED SALES
        // =================================================

        var processedReceipts =
            _context.Receipts
                .Where(r => r.IsProcessed);


        // =================================================
        // TOTAL SALES
        // =================================================

        var totalSales =
            await processedReceipts.CountAsync();


        // =================================================
        // TOTAL REVENUE
        // =================================================

        var totalRevenue =
            await processedReceipts
                .Select(r => (decimal?)r.GrandTotal)
                .SumAsync() ?? 0m;


        // =================================================
        // LOW STOCK PRODUCTS
        // Only active products are shown
        // =================================================

        var lowStockProducts =
            await _context.Products
                .Where(p =>
                    !p.IsDeleted &&
                    p.Quantity <= 10)
                .OrderBy(p => p.Quantity)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Category,
                    p.Quantity,
                    p.Price
                })
                .ToListAsync();


        // =================================================
        // BEST-SELLING PRODUCTS
        // Historical sales are kept even if the product
        // has been soft-deleted.
        // =================================================

        var bestSellingProducts =
            await _context.ReceiptItems
                .Where(ri => ri.Receipt.IsProcessed)
                .GroupBy(ri => new
                {
                    ri.ProductId,
                    ri.Product.Name,
                    ri.Product.Category
                })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    Category = g.Key.Category,
                    UnitsSold = g.Sum(ri => ri.Quantity),
                    Revenue = g.Sum(ri => ri.Total)
                })
                .OrderByDescending(x => x.UnitsSold)
                .Take(5)
                .ToListAsync();


        // =================================================
        // RESPONSE
        // =================================================

        return Ok(new
        {
            TotalProducts = totalProducts,

            TotalInventoryUnits = totalInventoryUnits,

            TotalSales = totalSales,

            TotalRevenue = totalRevenue,

            LowStockProducts = lowStockProducts,

            BestSellingProducts = bestSellingProducts
        });
    }


    // =====================================================
    // USER DASHBOARD
    // =====================================================

    [Authorize(Roles = "User")]
    [HttpGet("user")]
    public async Task<IActionResult> GetUserDashboard()
    {
        // =================================================
        // GET CURRENT USER ID
        // =================================================

        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user identity.");
        }


        // =================================================
        // AVAILABLE PRODUCTS
        // Only active products are counted
        // =================================================

        var availableProducts =
            await _context.Products
                .CountAsync(p =>
                    !p.IsDeleted &&
                    p.Quantity > 0);


        // =================================================
        // USER RECEIPTS
        // =================================================

        var myReceipts =
            _context.Receipts
                .Where(r =>
                    r.UserId == userId &&
                    r.IsProcessed);


        // =================================================
        // MY PURCHASES
        // =================================================

        var myPurchases =
            await myReceipts.CountAsync();


        // =================================================
        // MY TOTAL SPENDING
        // =================================================

        var myTotalSpending =
            await myReceipts
                .Select(r => (decimal?)r.GrandTotal)
                .SumAsync() ?? 0m;


        // =================================================
        // RECENT PURCHASES
        // =================================================

        var recentPurchases =
            await myReceipts
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new
                {
                    r.Id,
                    r.CreatedAt,
                    r.Subtotal,
                    r.Tax,
                    r.GrandTotal,

                    Items = r.Content
                })
                .ToListAsync();


        // =================================================
        // BEST-SELLING PRODUCTS
        // Historical sales are kept even if the product
        // has been soft-deleted.
        // =================================================

        var bestSellingProducts =
            await _context.ReceiptItems
                .Where(ri => ri.Receipt.IsProcessed)
                .GroupBy(ri => new
                {
                    ri.ProductId,
                    ri.Product.Name,
                    ri.Product.Category
                })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    Category = g.Key.Category,
                    UnitsSold = g.Sum(ri => ri.Quantity),
                    Revenue = g.Sum(ri => ri.Total)
                })
                .OrderByDescending(x => x.UnitsSold)
                .Take(5)
                .ToListAsync();


        // =================================================
        // RESPONSE
        // =================================================

        return Ok(new
        {
            AvailableProducts = availableProducts,

            MyPurchases = myPurchases,

            MyTotalSpending = myTotalSpending,

            RecentPurchases = recentPurchases,

            BestSellingProducts = bestSellingProducts
        });
    }
}