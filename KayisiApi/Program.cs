using Microsoft.EntityFrameworkCore;
using KayisiApi;

var builder = WebApplication.CreateBuilder(args);

// DB
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=kayisi.db"));

// CONTROLLER
builder.Services.AddControllers();

// 🔥 CORS EKLE
builder.Services.AddCors(options =>
{
    options.AddPolicy("izin", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🔥 CORS AKTİF ET (EN KRİTİK YER)
app.UseCors("izin");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.ExecuteSqlRaw("UPDATE Products SET ImageUrls = '[]' WHERE ImageUrls IS NULL");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseHttpsRedirection();

app.MapControllers();

app.Run();