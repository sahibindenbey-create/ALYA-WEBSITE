/* ALYA HOMES - order linked stock movements */
IF OBJECT_ID('dbo.AlyaStockMovements','U') IS NOT NULL
AND COL_LENGTH('dbo.AlyaStockMovements','OrderNo') IS NULL
BEGIN
    ALTER TABLE dbo.AlyaStockMovements ADD OrderNo nvarchar(60) NULL;
END;
GO

IF OBJECT_ID('dbo.AlyaStockMovements','U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_AlyaStockMovements_OrderNo' AND object_id=OBJECT_ID('dbo.AlyaStockMovements'))
BEGIN
    CREATE INDEX IX_AlyaStockMovements_OrderNo ON dbo.AlyaStockMovements(OrderNo, MovementType, ProductSlug);
END;
GO
