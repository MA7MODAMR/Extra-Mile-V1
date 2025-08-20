using Microsoft.AspNetCore.Http;

namespace API.Services;

public interface IFileUploadService
{
    Task<string> UploadProductImageAsync(IFormFile file);
    void DeleteProductImageAsync(string fileName);
}

public class FileUploadService : IFileUploadService
{
    private readonly IWebHostEnvironment _environment;
    private readonly string _productImagesPath;

    public FileUploadService(IWebHostEnvironment environment)
    {
        _environment = environment;
        _productImagesPath = Path.Combine(_environment.WebRootPath, "images", "products");
        
        // Ensure the directory exists
        if (!Directory.Exists(_productImagesPath))
        {
            Directory.CreateDirectory(_productImagesPath);
        }
    }

    public async Task<string> UploadProductImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty or null");

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(fileExtension))
            throw new ArgumentException("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.");

        // Validate file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
            throw new ArgumentException("File size too large. Maximum size is 10MB.");

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(_productImagesPath, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return the relative path for database storage
        return $"/images/products/{fileName}";
    }

    public void DeleteProductImageAsync(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return;

        // Extract just the filename from the path
        var fileNameOnly = Path.GetFileName(fileName);
        if (string.IsNullOrEmpty(fileNameOnly))
            return;

        var filePath = Path.Combine(_productImagesPath, fileNameOnly);
        
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }
}
