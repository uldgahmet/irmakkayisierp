using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KayisiApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminPassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminPassword",
                table: "StoreSettings",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminPassword",
                table: "StoreSettings");
        }
    }
}
