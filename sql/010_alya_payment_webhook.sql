/* ALYA HOMES V24 - payment callback hardening. No card data is stored. */
IF OBJECT_ID('dbo.AlyaPaymentAttempts','U') IS NOT NULL
BEGIN
  IF COL_LENGTH('dbo.AlyaPaymentAttempts','LastWebhookAt') IS NULL
    ALTER TABLE dbo.AlyaPaymentAttempts ADD LastWebhookAt datetime2(0) NULL;
END;
GO
