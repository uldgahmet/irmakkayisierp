using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace KayisiApi   // 👈 BURASI ÇOK KRİTİK
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseSqlite("Data Source=kayisi.db");

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}