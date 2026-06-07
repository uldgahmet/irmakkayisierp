using Microsoft.AspNetCore.Mvc;
using KayisiApi;
using KayisiApi.Models;

[ApiController]
[Route("api/[controller]")]
public class BannersController : ControllerBase
{
    private readonly AppDbContext _context;

    public BannersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetBanners()
    {
        return Ok(_context.Banners.ToList());
    }

    [HttpPost]
    public IActionResult AddBanner(Banner banner)
    {
        _context.Banners.Add(banner);
        _context.SaveChanges();
        return Ok(banner);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateBanner(int id, Banner updatedBanner)
    {
        var banner = _context.Banners.Find(id);
        if (banner == null) return NotFound();

        banner.Title = updatedBanner.Title;
        if (!string.IsNullOrEmpty(updatedBanner.ImageUrl))
        {
            banner.ImageUrl = updatedBanner.ImageUrl;
        }

        _context.SaveChanges();
        return Ok(banner);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteBanner(int id)
    {
        var banner = _context.Banners.Find(id);
        if (banner == null) return NotFound();

        _context.Banners.Remove(banner);
        _context.SaveChanges();
        return Ok(new { message = "Afiş silindi" });
    }
}
