namespace QuickStopMart.Api.Models;

public class CartItem
{
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }

    public decimal LineTotal => Product.Price * Quantity;
}