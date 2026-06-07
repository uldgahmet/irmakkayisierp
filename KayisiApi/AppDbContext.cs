using Microsoft.EntityFrameworkCore;
using KayisiApi.Models;   // 👈 BU ÖNEMLİ
using System.Text.Json;
using System.Collections.Generic;

namespace KayisiApi       // 👈 BU DA ÖNEMLİ
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Banner> Banners { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<StoreSettings> StoreSettings { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>()
                .Property(p => p.ImageUrls)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null)
                );
        }
    }
}