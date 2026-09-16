/* ALYA HOMES V15 - normalized SQL performance indexes */
IF OBJECT_ID('dbo.AlyaProducts','U') IS NOT NULL
BEGIN
 IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UX_AlyaProducts_Slug' AND object_id=OBJECT_ID('dbo.AlyaProducts')) CREATE UNIQUE INDEX UX_AlyaProducts_Slug ON dbo.AlyaProducts(Slug);
 IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_AlyaProducts_CategoryActive' AND object_id=OBJECT_ID('dbo.AlyaProducts')) CREATE INDEX IX_AlyaProducts_CategoryActive ON dbo.AlyaProducts(Category,IsActive);
END
IF OBJECT_ID('dbo.AlyaOrders','U') IS NOT NULL
BEGIN
 IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UX_AlyaOrders_OrderNo' AND object_id=OBJECT_ID('dbo.AlyaOrders')) CREATE UNIQUE INDEX UX_AlyaOrders_OrderNo ON dbo.AlyaOrders(OrderNo);
 IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_AlyaOrders_StatusCreated' AND object_id=OBJECT_ID('dbo.AlyaOrders')) CREATE INDEX IX_AlyaOrders_StatusCreated ON dbo.AlyaOrders(Status,CreatedAt DESC);
END
IF OBJECT_ID('dbo.AlyaCustomers','U') IS NOT NULL
BEGIN
 IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UX_AlyaCustomers_Email' AND object_id=OBJECT_ID('dbo.AlyaCustomers')) CREATE UNIQUE INDEX UX_AlyaCustomers_Email ON dbo.AlyaCustomers(Email) WHERE Email IS NOT NULL;
END
