/* ALYA HOMES - stock movements */
IF OBJECT_ID('dbo.AlyaStockMovements','U') IS NULL
BEGIN
    CREATE TABLE dbo.AlyaStockMovements (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AlyaStockMovements PRIMARY KEY,
        ProductSlug nvarchar(180) NOT NULL,
        MovementType nvarchar(30) NOT NULL,
        Quantity int NOT NULL,
        PreviousStock int NOT NULL,
        NewStock int NOT NULL,
        Note nvarchar(500) NULL,
        CreatedAt datetime2(0) NOT NULL CONSTRAINT DF_AlyaStockMovements_CreatedAt DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_AlyaStockMovements_ProductDate ON dbo.AlyaStockMovements(ProductSlug, CreatedAt DESC);
END;
GO
