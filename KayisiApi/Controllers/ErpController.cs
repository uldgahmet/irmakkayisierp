using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KayisiApi.Models;

namespace KayisiApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ErpController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ErpController(AppDbContext context)
        {
            _context = context;
        }

        // 📊 ERP DASHBOARD
        [HttpGet("dashboard")]
        public IActionResult GetDashboard()
        {
            var totalProducts = _context.Products.Count();
            var totalStock = _context.Products.Any() ? _context.Products.Sum(p => p.Stock) : 0;
            var criticalStockCount = _context.Products.Count(p => p.Stock < 10);
            var supplierCount = _context.Suppliers.Count();

            return Ok(new
            {
                totalProducts,
                totalStock,
                criticalStockCount,
                supplierCount
            });
        }

        // ⚠️ KRİTİK STOKTAKİ ÜRÜNLER (TEDARİKÇİ ÖNERİSİ İLE BİRLİKTE)
        [HttpGet("critical-products")]
        public IActionResult GetCriticalProducts()
        {
            var criticalProducts = _context.Products
                .Include(p => p.Supplier)
                .Where(p => p.Stock < 10)
                .Select(p => new
                {
                    productName = p.Name,
                    stock = p.Stock,
                    supplier = p.Supplier != null ? p.Supplier.Name : "Tedarikçi Atanmamış",
                    supplierPhone = p.Supplier != null ? p.Supplier.Phone : ""
                })
                .ToList();

            return Ok(criticalProducts);
        }

        // 🛒 SİPARİŞ SONRASI OTOMATİK STOK DÜŞÜRME
        [HttpPost("checkout")]
        public IActionResult Checkout([FromBody] List<CheckoutItemDto> items)
        {
            if (items == null || !items.Any())
                return BadRequest(new { message = "Sepet boş olamaz." });

            var productIds = items.Select(i => i.ProductId).ToList();
            var products = _context.Products.Where(p => productIds.Contains(p.Id)).ToList();

            // 1. Aşama: Stok Kontrolü
            foreach (var item in items)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                if (product == null)
                    return NotFound(new { message = $"Ürün bulunamadı: ID {item.ProductId}" });

                if (product.Stock < item.Quantity)
                {
                    return BadRequest(new { message = $"'{product.Name}' ürünü için yetersiz stok! Mevcut stok: {product.Stock}, İstenen: {item.Quantity}" });
                }
            }

            // 2. Aşama: Stok Azaltma
            foreach (var item in items)
            {
                var product = products.First(p => p.Id == item.ProductId);
                product.Stock -= item.Quantity;
            }

            _context.SaveChanges();
            return Ok(new { message = "Sipariş onaylandı ve stoklar düşürüldü." });
        }
    }

    public class CheckoutItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
