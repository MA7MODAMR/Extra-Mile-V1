using API.DTOs;
using API.Extensions;
using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Vendor")]
public class VendorController(IUnitOfWork unit) : BaseApiController
{
    [HttpGet("products")]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetVendorProducts([FromQuery] ProductSpecParams productParams)
    {
        var vendorId = User.GetUserId();
        var spec = new VendorProductSpecification(vendorId, productParams);

        return await CreatePagedResult(unit.Repository<Product>(), spec,
            productParams.PageIndex, productParams.PageSize);
    }

    [HttpGet("products/{id}")]
    public async Task<ActionResult<Product>> GetVendorProduct(int id)
    {
        var vendorId = User.GetUserId();
        var spec = new VendorProductSpecification(vendorId, id);
        var product = await unit.Repository<Product>().GetEntityWithSpec(spec);

        if (product == null) return NotFound();

        return product;
    }

    [HttpPost("products")]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        
        // Vendor creates products as pending
        product.Status = ProductStatus.Pending;
        product.VendorId = User.GetUserId();
        

        unit.Repository<Product>().Add(product);

        if (await unit.Complete())
        {
            return CreatedAtAction("GetVendorProduct", new { id = product.Id }, product);
        }
        ;

        return BadRequest("Problem creating product");
    }

    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product productDto)
    {
        var vendorId = User.GetUserId();
        var spec = new VendorProductSpecification(vendorId, id);
        var product = await unit.Repository<Product>().GetEntityWithSpec(spec);

        if (product == null) return NotFound();

        // Only allow updates to pending or rejected products
        if (product.Status == ProductStatus.Approved)
        {
            return BadRequest("Cannot update approved products. Please create a new product.");
        }

        product.Name = productDto.Name;
        product.Description = productDto.Description;
        product.Price = productDto.Price;
        product.PictureUrl = productDto.PictureUrl;
        product.Type = productDto.Type;
        product.Brand = productDto.Brand;
        product.QuantityInStock = productDto.QuantityInStock;

        // Reset status to pending
        
        product.Status = ProductStatus.Pending;
        
        unit.Repository<Product>().Update(product);

        if (await unit.Complete())
        {
            return NoContent();
        }

        return BadRequest("Problem updating the product");
    }

    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var vendorId = User.GetUserId();
        var spec = new VendorProductSpecification(vendorId, id);
        var product = await unit.Repository<Product>().GetEntityWithSpec(spec);

        if (product == null) return NotFound();

        unit.Repository<Product>().Remove(product);

        if (await unit.Complete())
        {
            return NoContent();
        }

        return BadRequest("Problem deleting the product");
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<VendorDashboardDto>> GetDashboard()
    {
        var vendorId = User.GetUserId();
        var spec = new VendorProductSpecification(vendorId);
        var products = await unit.Repository<Product>().ListAsync(spec);

        var dashboard = new VendorDashboardDto
        {
            TotalProducts = products.Count,
            PendingProducts = products.Count(p => p.Status == ProductStatus.Pending),
            ApprovedProducts = products.Count(p => p.Status == ProductStatus.Approved),
            RejectedProducts = products.Count(p => p.Status == ProductStatus.Rejected),
            Products = products
        };

        return dashboard;
    }
}