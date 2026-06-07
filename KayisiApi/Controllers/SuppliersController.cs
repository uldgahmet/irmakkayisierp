using Microsoft.AspNetCore.Mvc;
using KayisiApi.Models;

namespace KayisiApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SuppliersController(AppDbContext context)
        {
            _context = context;
        }

        // 📄 TÜM TEDARİKÇİLER
        [HttpGet]
        public IActionResult GetSuppliers()
        {
            return Ok(_context.Suppliers.ToList());
        }

        // 📄 TEKİL TEDARİKÇİ
        [HttpGet("{id}")]
        public IActionResult GetSupplier(int id)
        {
            var supplier = _context.Suppliers.Find(id);
            if (supplier == null)
                return NotFound();
            return Ok(supplier);
        }

        // ➕ TEDARİKÇİ EKLE
        [HttpPost]
        public IActionResult AddSupplier(Supplier supplier)
        {
            _context.Suppliers.Add(supplier);
            _context.SaveChanges();
            return Ok(supplier);
        }

        // ✏️ TEDARİKÇİ GÜNCELLEME
        [HttpPut("{id}")]
        public IActionResult UpdateSupplier(int id, Supplier updatedSupplier)
        {
            var supplier = _context.Suppliers.Find(id);
            if (supplier == null)
                return NotFound();

            supplier.Name = updatedSupplier.Name;
            supplier.Phone = updatedSupplier.Phone;

            _context.SaveChanges();
            return Ok(supplier);
        }

        // 🗑️ TEDARİKÇİ SİLME
        [HttpDelete("{id}")]
        public IActionResult DeleteSupplier(int id)
        {
            var supplier = _context.Suppliers.Find(id);
            if (supplier == null)
                return NotFound();

            // Tedarikçiye bağlı ürünlerin SupplierId'sini null yapalım ki veri bütünlüğü bozulmasın
            var relatedProducts = _context.Products.Where(p => p.SupplierId == id).ToList();
            foreach (var prod in relatedProducts)
            {
                prod.SupplierId = null;
            }

            _context.Suppliers.Remove(supplier);
            _context.SaveChanges();
            return Ok(new { message = "Silindi" });
        }
    }
}
