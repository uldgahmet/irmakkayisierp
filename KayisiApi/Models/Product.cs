namespace KayisiApi.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>(); // Yeni eklenen: Çoklu resim desteği
        public string Description { get; set; } // Ürün açıklaması
        public int Stock { get; set; }
        public string Unit { get; set; } // e.g., "kg", "adet"
        public string Category { get; set; } // Store category name for simplicity
        
        public int? SupplierId { get; set; }
        public Supplier? Supplier { get; set; }
    }
}