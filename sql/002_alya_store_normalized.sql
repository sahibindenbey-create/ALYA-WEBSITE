/* ALYA HOMES - normalize products, customers and orders */

IF OBJECT_ID('dbo.AlyaProducts','U') IS NULL
BEGIN
    CREATE TABLE dbo.AlyaProducts (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AlyaProducts PRIMARY KEY,
        Slug nvarchar(180) NOT NULL CONSTRAINT UQ_AlyaProducts_Slug UNIQUE,
        Code nvarchar(80) NULL,
        Name nvarchar(250) NOT NULL,
        Category nvarchar(120) NULL,
        Price decimal(18,2) NULL,
        Stock int NULL,
        Discount decimal(5,2) NULL,
        Image nvarchar(500) NULL,
        Description nvarchar(max) NULL,
        IsActive bit NOT NULL CONSTRAINT DF_AlyaProducts_IsActive DEFAULT 1,
        SourceType nvarchar(30) NOT NULL CONSTRAINT DF_AlyaProducts_SourceType DEFAULT 'catalog',
        UpdatedAt datetime2(0) NOT NULL CONSTRAINT DF_AlyaProducts_UpdatedAt DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID('dbo.AlyaCustomers','U') IS NULL
BEGIN
    CREATE TABLE dbo.AlyaCustomers (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AlyaCustomers PRIMARY KEY,
        Email nvarchar(320) NOT NULL CONSTRAINT UQ_AlyaCustomers_Email UNIQUE,
        FirstName nvarchar(100) NULL,
        LastName nvarchar(100) NULL,
        Phone nvarchar(50) NULL,
        AddressLine nvarchar(500) NULL,
        City nvarchar(100) NULL,
        District nvarchar(100) NULL,
        PostalCode nvarchar(20) NULL,
        UpdatedAt datetime2(0) NOT NULL CONSTRAINT DF_AlyaCustomers_UpdatedAt DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID('dbo.AlyaOrders','U') IS NULL
BEGIN
    CREATE TABLE dbo.AlyaOrders (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AlyaOrders PRIMARY KEY,
        OrderNo nvarchar(60) NOT NULL CONSTRAINT UQ_AlyaOrders_OrderNo UNIQUE,
        CustomerId bigint NULL,
        Status nvarchar(60) NOT NULL,
        PaymentMethod nvarchar(60) NULL,
        Subtotal decimal(18,2) NOT NULL CONSTRAINT DF_AlyaOrders_Subtotal DEFAULT 0,
        Shipping decimal(18,2) NOT NULL CONSTRAINT DF_AlyaOrders_Shipping DEFAULT 0,
        Total decimal(18,2) NOT NULL CONSTRAINT DF_AlyaOrders_Total DEFAULT 0,
        CreatedAt datetime2(0) NOT NULL CONSTRAINT DF_AlyaOrders_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt datetime2(0) NULL,
        CONSTRAINT FK_AlyaOrders_Customer FOREIGN KEY (CustomerId) REFERENCES dbo.AlyaCustomers(Id)
    );
END;
GO

IF OBJECT_ID('dbo.AlyaOrderItems','U') IS NULL
BEGIN
    CREATE TABLE dbo.AlyaOrderItems (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AlyaOrderItems PRIMARY KEY,
        OrderId bigint NOT NULL,
        ProductSlug nvarchar(180) NOT NULL,
        ProductCode nvarchar(80) NULL,
        ProductName nvarchar(250) NOT NULL,
        UnitPrice decimal(18,2) NOT NULL CONSTRAINT DF_AlyaOrderItems_UnitPrice DEFAULT 0,
        Quantity int NOT NULL,
        LineTotal AS (UnitPrice * Quantity) PERSISTED,
        CONSTRAINT FK_AlyaOrderItems_Order FOREIGN KEY (OrderId) REFERENCES dbo.AlyaOrders(Id) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_AlyaOrders_CustomerId' AND object_id=OBJECT_ID('dbo.AlyaOrders'))
    CREATE INDEX IX_AlyaOrders_CustomerId ON dbo.AlyaOrders(CustomerId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_AlyaOrderItems_OrderId' AND object_id=OBJECT_ID('dbo.AlyaOrderItems'))
    CREATE INDEX IX_AlyaOrderItems_OrderId ON dbo.AlyaOrderItems(OrderId);
GO
