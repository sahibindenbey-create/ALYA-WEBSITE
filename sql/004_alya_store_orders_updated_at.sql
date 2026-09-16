/* Existing installations: add order update timestamp used by admin status changes. */
IF OBJECT_ID('dbo.AlyaOrders','U') IS NOT NULL
AND COL_LENGTH('dbo.AlyaOrders','UpdatedAt') IS NULL
BEGIN
    ALTER TABLE dbo.AlyaOrders ADD UpdatedAt datetime2(0) NULL;
END;
GO
