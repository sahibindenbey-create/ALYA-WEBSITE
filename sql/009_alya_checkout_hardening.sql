/* ALYA HOMES V23 - checkout hardening */
IF OBJECT_ID('dbo.AlyaOrders','U') IS NOT NULL
BEGIN
  IF COL_LENGTH('dbo.AlyaOrders','PaymentProvider') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD PaymentProvider NVARCHAR(50) NULL;
  IF COL_LENGTH('dbo.AlyaOrders','PaymentReference') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD PaymentReference NVARCHAR(120) NULL;
  IF COL_LENGTH('dbo.AlyaOrders','CheckoutToken') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD CheckoutToken NVARCHAR(120) NULL;

  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UX_AlyaOrders_CheckoutToken' AND object_id=OBJECT_ID('dbo.AlyaOrders'))
    CREATE UNIQUE INDEX UX_AlyaOrders_CheckoutToken ON dbo.AlyaOrders(CheckoutToken) WHERE CheckoutToken IS NOT NULL;
END;
