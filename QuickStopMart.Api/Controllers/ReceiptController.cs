using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickStopMart.Api.Data;
using System.Security.Claims;

namespace QuickStopMart.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReceiptsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReceiptsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetReceipts()
    {
        var role =
            User.FindFirst(ClaimTypes.Role)?.Value;

        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user identity.");
        }

        /*
         * =====================================================
         * ADMIN
         * =====================================================
         *
         * Admin can see all processed receipts that have NOT
         * been hidden from the Admin receipts list.
         *
         * Hidden receipts are NOT deleted from the database.
         */

        if (role == "Admin")
        {
            var receipts = await _context.Receipts
                .Include(r => r.User)
                .Where(r =>
                    r.IsProcessed &&
                    !r.HiddenFromAdmin)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    UserName = r.User.UserName,
                    r.Content,
                    r.CreatedAt,
                    r.IsProcessed
                })
                .ToListAsync();

            return Ok(receipts);
        }

        /*
         * =====================================================
         * USER
         * =====================================================
         *
         * User can see all of their own processed receipts.
         *
         * HiddenFromAdmin is intentionally NOT checked here.
         *
         * This means a receipt hidden by Admin will still be
         * visible to the customer who made the purchase.
         */

        var userReceipts = await _context.Receipts
            .Include(r => r.User)
            .Where(r =>
                r.UserId == userId &&
                r.IsProcessed)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.UserId,
                UserName = r.User.UserName,
                r.Content,
                r.CreatedAt,
                r.IsProcessed
            })
            .ToListAsync();

        return Ok(userReceipts);
    }

    /*
     * =========================================================
     * ADMIN DELETE
     * =========================================================
     *
     * This does NOT physically delete the receipt.
     *
     * It only hides the receipt from the Admin receipts list.
     *
     * The receipt remains in SQL Server and the customer can
     * still see it.
     */

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReceipt(int id)
    {
        var receipt =
            await _context.Receipts.FindAsync(id);

        if (receipt == null)
        {
            return NotFound("Receipt not found.");
        }

        receipt.HiddenFromAdmin = true;

        await _context.SaveChangesAsync();

        return Ok("Receipt removed from the Admin receipts list.");
    }
}