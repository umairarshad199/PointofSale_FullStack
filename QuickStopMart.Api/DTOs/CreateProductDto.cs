namespace QuickStopMart.Api.DTOs;

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
}