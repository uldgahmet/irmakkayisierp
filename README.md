# Irmak Kayısı ERP Sistemi

## Proje Hakkında

Irmak Kayısı ERP Sistemi, bir e-ticaret altyapısı üzerine geliştirilmiş basit bir Kurumsal Kaynak Planlama (ERP) uygulamasıdır. Proje, ürünlerin stok takibini, tedarikçi yönetimini ve temel işletme süreçlerini tek bir sistem üzerinden yönetmeyi amaçlamaktadır.

Bu proje eğitim amaçlı geliştirilmiş olup ERP sistemlerinin temel mantığını göstermektedir.

## Özellikler

### Ürün Yönetimi

* Ürün ekleme
* Ürün güncelleme
* Ürün silme
* Ürün listeleme
* Stok takibi

### Kategori Yönetimi

* Kategori ekleme
* Kategori güncelleme
* Kategori silme
* Kategori listeleme

### Tedarikçi Yönetimi

* Tedarikçi ekleme
* Tedarikçi listeleme
* Ürün ve tedarikçi ilişkilendirme

### Stok Takibi

* Ürün stok miktarlarını görüntüleme
* Kritik stok seviyelerini takip etme
* Düşük stoklu ürünleri raporlama

### ERP Özellikleri

* Merkezi ürün yönetimi
* Tedarikçi bazlı ürün takibi
* Stok kontrolü
* Yönetim paneli desteği

## Kullanılan Teknolojiler

### Backend

* ASP.NET Core Web API
* C#
* Entity Framework Core

### Veritabanı

* SQLite

### Frontend

* HTML
* CSS
* JavaScript

## Veritabanı Yapısı

Projede aşağıdaki temel tablolar bulunmaktadır:

* Products
* Categories
* Suppliers
* Banners
* StoreSettings

## Kurulum

1. Projeyi klonlayın:

```bash
git clone https://github.com/uldgahmet/irmakkayisierp.git
```

2. Proje dizinine girin:

```bash
cd irmakkayisierp
```

3. Bağımlılıkları yükleyin:

```bash
dotnet restore
```

4. Projeyi çalıştırın:

```bash
dotnet run
```

5. Tarayıcıdan uygulamayı açın.

## Projenin Amacı

Bu proje, ERP sistemlerinde bulunan ürün, stok ve tedarikçi yönetimi süreçlerini basitleştirilmiş bir şekilde uygulamak amacıyla geliştirilmiştir. Satış ve stok süreçlerinin tek merkezden yönetilebilmesi hedeflenmiştir.

## Geliştirici

Ahmet Uludağ

Yazılım Mühendisliği Öğrencisi
