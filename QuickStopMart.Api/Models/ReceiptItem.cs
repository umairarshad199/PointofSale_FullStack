namespace QuickStopMart.Api.Models;

public class ReceiptItem
{
    public int Id { get; set; }

    public int ReceiptId { get; set; }

    public Receipt Receipt { get; set; } = null!;

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Total { get; set; }
}