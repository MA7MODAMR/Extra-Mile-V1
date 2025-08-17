using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(IUnitOfWork unit, IPaymentService paymentService) : BaseApiController
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
}
