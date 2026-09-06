using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuickStopMart.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReceiptAmounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "GrandTotal",
                table: "Receipts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                table: "Receipts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Tax",
                table: "Receipts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GrandTotal",
                table: "Receipts");

            migrationBuilder.DropColumn(
                name: "Subtotal",
                table: "Receipts");

            migrationBuilder.DropColumn(
                name: "Tax",
                table: "Receipts");
        }
    }
}
