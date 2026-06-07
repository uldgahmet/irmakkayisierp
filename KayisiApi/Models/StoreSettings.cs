namespace KayisiApi.Models
{
    public class StoreSettings
    {
        public int Id { get; set; }
        public string StoreName { get; set; } = "Irmak Kayısı";
        public string Address { get; set; } = "";
        public string InstagramUrl { get; set; } = "https://instagram.com/irmakkayisi";
        public string PhoneNumber { get; set; } = "0531 593 02 44";
        public string ContactEmail { get; set; } = "iletisim@irmakkayisi.com";
        public string MapUrl { get; set; } = "https://share.google/MRsSAkS2ytNcq0puG";
        public string AboutUs { get; set; } = "Irmak Kayısı olarak en taze, en doğal ve en kaliteli yöresel ürünleri, kuru meyveleri ve çerezleri doğrudan üreticiden alıp sofralarınıza getiriyoruz.";
        public string AdminPassword { get; set; } = "1234";
    }
}
