/* ALYA HOMES - order tracking and payment status */
IF OBJECT_ID('dbo.AlyaOrders','U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.AlyaOrders','PaymentStatus') IS NULL
        ALTER TABLE dbo.AlyaOrders ADD PaymentStatus nvarchar(40) NULL CONSTRAINT DF_AlyaOrders_PaymentStatus DEFAULT 'Bekliyor';
    IF COL_LENGTH('dbo.AlyaOrders','Carrier') IS NULL
        ALTER TABLE dbo.AlyaOrders ADD Carrier nvarchar(100) NULL;
    IF COL_LENGTH('dbo.AlyaOrders','TrackingNumber') IS NULL
        ALTER TABLE dbo.AlyaOrders ADD TrackingNumber nvarchar(120) NULL;
END;
GO
IF OBJECT_ID('dbo.AlyaOrderStatusHistory','U') IS NULL
BEGIN
    CREATE TABLE dbo.AlyaOrderStatusHistory (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AlyaOrderStatusHistory PRIMARY KEY,
        OrderId bigint NOT NULL,
        Status nvarchar(60) NOT NULL,
        Note nvarchar(500) NULL,
        CreatedAt datetime2(0) NOT NULL CONSTRAINT DF_AlyaOrderStatusHistory_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_AlyaOrderStatusHistory_Order FOREIGN KEY (OrderId) REFERENCES dbo.AlyaOrders(Id) ON DELETE CASCADE
    );
    CREATE INDEX IX_AlyaOrderStatusHistory_OrderCreated ON dbo.AlyaOrderStatusHistory(OrderId,CreatedAt);
END;
GO
INSERT dbo.AlyaOrderStatusHistory(OrderId,Status,Note)
SELECT o.Id,o.Status,N'Mevcut sipariş durumu'
FROM dbo.AlyaOrders o
WHERE NOT EXISTS (SELECT 1 FROM dbo.AlyaOrderStatusHistory h WHERE h.OrderId=o.Id);
GO
