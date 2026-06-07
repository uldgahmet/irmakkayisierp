using Microsoft.AspNetCore.Mvc;
using KayisiApi;
using KayisiApi.Models;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetCategories()
    {
        return Ok(_context.Categories.ToList());
    }

    [HttpPost]
    public IActionResult AddCategory(Category category)
    {
        _context.Categories.Add(category);
        _context.SaveChanges();
        return Ok(category);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteCategory(int id)
    {
        var category = _context.Categories.Find(id);
        if (category == null) return NotFound();

        _context.Categories.Remove(category);
        _context.SaveChanges();
        return Ok(new { message = "Kategori silindi" });
    }
}
