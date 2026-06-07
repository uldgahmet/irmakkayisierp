using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KayisiApi;
using KayisiApi.Models;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    // ➕ ÜRÜN EKLE
    [HttpPost]
    public IActionResult AddProduct(Product product)
    {
        _context.Products.Add(product);
        _context.SaveChanges();
        return Ok(product);
    }

    // 📄 TÜM ÜRÜNLER
    [HttpGet]
    public IActionResult GetProducts()
    {
        return Ok(_context.Products.Include(p => p.Supplier).ToList());
    }

    // 🛒 WHATSAPP SİPARİŞ
    [HttpGet("order/{id}")]
    public IActionResult Order(int id)
    {
        var product = _context.Products.Find(id);

        if (product == null)
            return NotFound();

        if (product.Stock <= 0)
        {
            return BadRequest(new { message = "Seçilen ürünün stoğu kalmamıştır." });
        }

        // Stoğu otomatik azalt
        product.Stock -= 1;
        _context.SaveChanges();

        var message = $"Merhaba, {product.Name} ürününden sipariş vermek istiyorum. Fiyat: {product.Price} TL";

        var url = $"https://wa.me/905315930244?text={Uri.EscapeDataString(message)}";

        return Ok(new { whatsapp = url });
    }

    // 🖼️ RESİM YÜKLEME
    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Dosya yok");

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");

        // klasör yoksa oluştur
        if (!Directory.Exists(folderPath))
            Directory.CreateDirectory(folderPath);

        var fullPath = Path.Combine(folderPath, fileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"/images/{fileName}";

        return Ok(new { imageUrl = url });
    }

    // ✏️ ÜRÜN GÜNCELLEME
    [HttpPut("{id}")]
    public IActionResult UpdateProduct(int id, Product updatedProduct)
    {
        var product = _context.Products.Find(id);
        if (product == null)
            return NotFound();

        product.Name = updatedProduct.Name;
        product.Price = updatedProduct.Price;
        product.ImageUrl = updatedProduct.ImageUrl;
        product.ImageUrls = updatedProduct.ImageUrls; // Yeni eklendi: çoklu resim
        product.Description = updatedProduct.Description;
        product.Stock = updatedProduct.Stock;
        product.Unit = updatedProduct.Unit;
        product.Category = updatedProduct.Category;
        product.SupplierId = updatedProduct.SupplierId;

        _context.SaveChanges();
        return Ok(product);
    }

    // 🗑️ ÜRÜN SİLME
    [HttpDelete("{id}")]
    public IActionResult DeleteProduct(int id)
    {
        var product = _context.Products.Find(id);
        if (product == null)
            return NotFound();

        _context.Products.Remove(product);
        _context.SaveChanges();
        return Ok(new { message = "Silindi" });
    }
}