using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KayisiApi.Migrations
{
    /// <inheritdoc />
    public partial class AddMultipleImagesAndSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrls",
                table: "Products",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "StoreSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StoreName = table.Column<string>(type: "TEXT", nullable: false),
                    Address = table.Column<string>(type: "TEXT", nullable: false),
                    InstagramUrl = table.Column<string>(type: "TEXT", nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: false),
                    ContactEmail = table.Column<string>(type: "TEXT", nullable: false),
                    MapUrl = table.Column<string>(type: "TEXT", nullable: false),
                    AboutUs = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "ImageUrls",
                table: "Products");
        }
    }
}
