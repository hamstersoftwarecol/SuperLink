-- Landing page enhancements: product images gallery + tenant branding

-- Multiple product images (JSON array of URLs)
ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]';

-- Product features/benefits (JSON array of strings)
ALTER TABLE products ADD COLUMN features TEXT DEFAULT '[]';

-- Tenant branding
ALTER TABLE tenants ADD COLUMN brand_color TEXT DEFAULT '#2563eb';
ALTER TABLE tenants ADD COLUMN logo_url TEXT;
ALTER TABLE tenants ADD COLUMN whatsapp TEXT;
