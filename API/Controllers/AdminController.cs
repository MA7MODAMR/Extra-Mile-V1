using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Numerics;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(IUnitOfWork unit, IPaymentService paymentService, UserManager<AppUser> userManager) : BaseApiController
{
    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders([FromQuery] OrderSpecParams specParams)
    {
        var spec = new OrderSpecification(specParams);

        return await CreatePagedResult(unit.Repository<Order>(),
            spec, specParams.PageIndex, specParams.PageSize, o => o.ToDto());
    }

    [HttpGet("orders/{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var spec = new OrderSpecification(id);

        var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

        if (order == null) return BadRequest("No order with that Id");

        return order.ToDto();
    }

    [HttpPost("orders/refund/{id:int}")]
    public async Task<ActionResult<OrderDto>> RefundOrder(int id)
    {
        var spec = new OrderSpecification(id);

        var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

        if (order == null) return BadRequest("No order with that Id");

        if (order.Status == OrderStatus.Pending)
            return BadRequest("Payment not received for this order");

        var result = await paymentService.RefundPayment(order.PaymentIntentId);

        if (result == "succeeded")
        {
            order.Status = OrderStatus.Refunded;

            await unit.Complete();

            return order.ToDto();
        }

        return BadRequest("Problem refunding order");
    }

    [HttpGet("products")]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetAllProducts([FromQuery] ProductSpecParams specParams)
    {
        var spec = new ProductSpecification(specParams); // null = all statuses

        return await CreatePagedResult(unit.Repository<Product>(), spec,
            specParams.PageIndex, specParams.PageSize);
    }

    [HttpPost("products/{id:int}/approve")]
    public async Task<ActionResult<Product>> ApproveProduct(int id)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);

        if (product == null) return NotFound();

        product.Status = ProductStatus.Approved;

        unit.Repository<Product>().Update(product);

        if (await unit.Complete())
        {
            return product;
        }

        return BadRequest("Problem approving product");
    }

    [HttpPost("products/{id:int}/reject")]
    public async Task<ActionResult<Product>> RejectProduct(int id)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);

        if (product == null) return NotFound();

        product.Status = ProductStatus.Rejected;

        unit.Repository<Product>().Update(product);

        if (await unit.Complete())
        {
            return product;
        }

        return BadRequest("Problem rejecting product");
    }

    [HttpPost("products/{id:int}/suspend")]
    public async Task<ActionResult<Product>> SuspendProduct(int id)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);

        if (product == null) return NotFound();

        product.Status = ProductStatus.Suspended;

        unit.Repository<Product>().Update(product);

        if (await unit.Complete())
        {
            return product;
        }

        return BadRequest("Problem suspending product");
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
    {
        var specParams = new ProductSpecParams();
        var productSpec = new ProductSpecification(specParams);
        productSpec.IsPagingEnabled = false; // We only need counts, not paged results
        // Count products directly in DB
        var totalProducts = await unit.Repository<Product>().CountAsync(productSpec);

        // Count pending products
        specParams.Status = ProductStatus.Pending;
        var pendingSpec = new ProductSpecification(specParams) { IsPagingEnabled = false };
        var pendingCount = await unit.Repository<Product>()
            .CountAsync(pendingSpec);

        // Count Approved Products
        specParams.Status = ProductStatus.Approved;
        var approvedSpec = new ProductSpecification(specParams) { IsPagingEnabled = false };
        var approvedCount = await unit.Repository<Product>()
            .CountAsync(approvedSpec);

        // Count Rejected
        specParams.Status = ProductStatus.Rejected;
        var rejectedSpec = new ProductSpecification(specParams) { IsPagingEnabled = false };
        var rejectedCount = await unit.Repository<Product>()
            .CountAsync(rejectedSpec);
        // Count Suspended
        specParams.Status = ProductStatus.Suspended;
        var suspendedSpec = new ProductSpecification(specParams) { IsPagingEnabled = false };
        var suspendedCount = await unit.Repository<Product>()
            .CountAsync(suspendedSpec);

        // Count vendors directly
        var totalVendors = (await userManager.GetUsersInRoleAsync("Vendor")).Count;

        // Calculate revenue without loading all orders
        var totalRevenue = await unit.Repository<Order>()
            .SumAsync(o => o.Subtotal + o.DeliveryMethod.Price);

        

        var dashboard = new AdminDashboardDto
        {
            TotalProducts = totalProducts,
            PendingProducts = pendingCount,
            ApprovedProducts = approvedCount,
            RejectedProducts = rejectedCount,
            SuspendedProducts = suspendedCount,
            VendorCount = (await userManager.GetUsersInRoleAsync("Vendor")).Count,
            TotalRevenue = (int)totalRevenue,
        };

        return dashboard;
    }
}
