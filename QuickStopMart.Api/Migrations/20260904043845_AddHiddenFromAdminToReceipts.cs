using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuickStopMart.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHiddenFromAdminToReceipts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HiddenFromAdmin",
                table: "Receipts",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HiddenFromAdmin",
                table: "Receipts");
        }
    }
}
