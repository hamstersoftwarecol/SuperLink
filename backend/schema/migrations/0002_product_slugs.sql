-- Add slug to products for public URLs
ALTER TABLE products ADD COLUMN slug TEXT;

-- Create unique index on (tenant_id, slug) so slugs are unique per tenant
CREATE UNIQUE INDEX idx_products_tenant_slug ON products(tenant_id, slug);
