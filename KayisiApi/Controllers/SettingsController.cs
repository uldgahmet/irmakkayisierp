using Microsoft.AspNetCore.Mvc;
using KayisiApi.Models;

namespace KayisiApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SettingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetSettings()
        {
            var settings = _context.StoreSettings.FirstOrDefault();
            if (settings == null)
            {
                settings = new StoreSettings();
                _context.StoreSettings.Add(settings);
                _context.SaveChanges();
            }
            
            // Güvenlik: Admin şifresini frontend'e göndermiyoruz
            var publicSettings = new {
                settings.Id,
                settings.StoreName,
                settings.Address,
                settings.InstagramUrl,
                settings.PhoneNumber,
                settings.ContactEmail,
                settings.MapUrl,
                settings.AboutUs
            };
            return Ok(publicSettings);
        }

        [HttpPost]
        public IActionResult UpdateSettings(StoreSettings updatedSettings)
        {
            var settings = _context.StoreSettings.FirstOrDefault();
            if (settings == null)
            {
                _context.StoreSettings.Add(updatedSettings);
            }
            else
            {
                settings.StoreName = updatedSettings.StoreName;
                settings.Address = updatedSettings.Address;
                settings.InstagramUrl = updatedSettings.InstagramUrl;
                settings.PhoneNumber = updatedSettings.PhoneNumber;
                settings.ContactEmail = updatedSettings.ContactEmail;
                settings.MapUrl = updatedSettings.MapUrl;
                settings.AboutUs = updatedSettings.AboutUs;
            }
            _context.SaveChanges();
            return Ok(updatedSettings);
        }

        [HttpPost("logo")]
        public async Task<IActionResult> UploadLogo(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Dosya yok");

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
            
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            // Logonun adını her zaman site-logo olarak kaydediyoruz ki üzerine yazılsın
            var fileName = "site-logo.png";
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Cache sorununu çözmek için sonuna tarih ekliyoruz
            var url = $"http://localhost:5054/images/{fileName}?t={DateTime.Now.Ticks}";

            return Ok(new { imageUrl = url });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var settings = _context.StoreSettings.FirstOrDefault();
            if (settings == null || settings.AdminPassword != request.Password)
            {
                return Unauthorized(new { message = "Hatalı Şifre!" });
            }
            return Ok(new { message = "Giriş başarılı" });
        }

        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var settings = _context.StoreSettings.FirstOrDefault();
            if (settings == null || settings.AdminPassword != request.OldPassword)
            {
                return BadRequest(new { message = "Mevcut şifre hatalı!" });
            }
            
            settings.AdminPassword = request.NewPassword;
            _context.SaveChanges();
            
            return Ok(new { message = "Şifre başarıyla güncellendi!" });
        }
    }

    public class LoginRequest
    {
        public string Password { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
