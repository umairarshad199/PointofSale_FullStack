namespace QuickStopMart.Api.Models;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string Category { get; set; } = string.Empty;

    public int Quantity { get; set; }

    // Soft delete flag
    // false = active product
    // true = deleted/hidden product
    public bool IsDeleted { get; set; } = false;
}
