using Microsoft.EntityFrameworkCore;
using QuickStopMart.Api.Models;

namespace QuickStopMart.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }

    public DbSet<User> Users { get; set; }

    public DbSet<Receipt> Receipts { get; set; }

    public DbSet<ReceiptItem> ReceiptItems { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // =====================================================
        // USER
        // =====================================================

        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.UserName)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<User>()
            .Property(u => u.PasswordHash)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .IsRequired()
            .HasMaxLength(20);


        // =====================================================
        // PRODUCT
        // =====================================================

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);


        // =====================================================
        // RECEIPT → USER
        // =====================================================

        modelBuilder.Entity<Receipt>()
            .HasOne(r => r.User)
            .WithMany(u => u.Receipts)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // =====================================================
        // RECEIPT MONEY
        // =====================================================

        modelBuilder.Entity<Receipt>()
            .Property(r => r.Subtotal)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Receipt>()
            .Property(r => r.Tax)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Receipt>()
            .Property(r => r.GrandTotal)
            .HasPrecision(18, 2);


        // =====================================================
        // RECEIPT ITEM → RECEIPT
        // =====================================================

        modelBuilder.Entity<ReceiptItem>()
            .HasOne(ri => ri.Receipt)
            .WithMany()
            .HasForeignKey(ri => ri.ReceiptId)
            .OnDelete(DeleteBehavior.Cascade);


        // =====================================================
        // RECEIPT ITEM → PRODUCT
        // =====================================================

        modelBuilder.Entity<ReceiptItem>()
            .HasOne(ri => ri.Product)
            .WithMany()
            .HasForeignKey(ri => ri.ProductId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // RECEIPT ITEM MONEY
        // =====================================================

        modelBuilder.Entity<ReceiptItem>()
            .Property(ri => ri.UnitPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ReceiptItem>()
            .Property(ri => ri.Total)
            .HasPrecision(18, 2);
    }
}