using System;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Name).IsRequired();

        // configuration for the enum
        //builder.Property(p => p.Status)
        //    .HasConversion(
        //        s => s.ToString(),
        //        s => (ProductStatus)Enum.Parse(typeof(ProductStatus), s)
            //); // Store the enum as a string (e.g., "Pending")
        builder.Property(p => p.Status)    
        .HasConversion<int>();


        builder.HasOne(p => p.Vendor)
            .WithMany()
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.SetNull);
}
}
