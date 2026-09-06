using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickStopMart.Api.DTOs;
using QuickStopMart.Api.Services;
using System.Security.Claims;

namespace QuickStopMart.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;
    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.Identity?.Name ?? "unknown";

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    [HttpPost("start")]
    public IActionResult StartNewSale()
    {
        _saleService.StartNewSale(UserId);
        return Ok("New sale started.");
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddItemDto dto)
    {
        try
        {
            await _saleService.AddItemAsync(
                UserId,
                dto.ProductId,
                dto.Quantity);

            return Ok("Item added.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("items/{productId}")]
    public IActionResult RemoveItem(int productId)
    {
        try
        {
            _saleService.RemoveItem(UserId, productId);
            return Ok("Item removed.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("undo")]
    public IActionResult Undo()
    {
        bool success = _saleService.UndoLastAction(UserId);
        if (success)
            return Ok("Undo successful.");
        return BadRequest("Nothing to undo.");
    }

    [HttpGet("cart")]
    public IActionResult GetCart()
    {
        var cart = _saleService.GetCart(UserId);
        var dtos = cart.Select(item => new CartItemDto
        {
            ProductId = item.Product.Id,
            ProductName = item.Product.Name,
            Price = item.Product.Price,
            Quantity = item.Quantity,
            LineTotal = item.LineTotal
        });
        return Ok(dtos);
    }

    [HttpGet("totals")]
    public IActionResult GetTotals()
    {
        var subtotal = _saleService.CalculateSubtotal(UserId);
        var tax = _saleService.CalculateTax(UserId);
        var grandTotal = _saleService.CalculateGrandTotal(UserId);
        return Ok(new { Subtotal = subtotal, Tax = tax, GrandTotal = grandTotal });
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout()
    {
        try
        {
            string receipt = await _saleService.CheckoutAsync(UserId);
            return Ok(new { Receipt = receipt });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("receipts/next")]
    public async Task<IActionResult> GetNextReceipt()
    {
        var receipt = await _saleService.GetNextReceiptAsync(UserId);
        if (receipt == null)
            return NotFound("No unprocessed receipts.");
        return Ok(new { Receipt = receipt });
    }
}