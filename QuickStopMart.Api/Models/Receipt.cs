namespace QuickStopMart.Api.Models;

public class Receipt
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsProcessed { get; set; } = false;

    // Amounts saved separately so the dashboard
    // can calculate sales and revenue correctly.
    public decimal Subtotal { get; set; }

    public decimal Tax { get; set; }

    public decimal GrandTotal { get; set; }

    // When true, the receipt is hidden from the Admin receipts list.
    // It is NOT deleted from the database and remains visible to the customer.
    public bool HiddenFromAdmin { get; set; } = false;
}