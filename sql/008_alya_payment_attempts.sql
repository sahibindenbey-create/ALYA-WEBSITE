/* ALYA HOMES - payment attempts. Never store raw card data. */
IF OBJECT_ID('dbo.AlyaPaymentAttempts','U') IS NULL
BEGIN
 CREATE TABLE dbo.AlyaPaymentAttempts(
  Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AlyaPaymentAttempts PRIMARY KEY,
  OrderId bigint NOT NULL,
  Reference nvarchar(100) NOT NULL,
  Provider nvarchar(60) NOT NULL,
  PaymentMethod nvarchar(60) NOT NULL,
  Amount decimal(18,2) NOT NULL,
  Status nvarchar(40) NOT NULL CONSTRAINT DF_AlyaPaymentAttempts_Status DEFAULT N'Bekliyor',
  ProviderTransactionId nvarchar(160) NULL,
  CreatedAt datetime2(0) NOT NULL CONSTRAINT DF_AlyaPaymentAttempts_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt datetime2(0) NOT NULL CONSTRAINT DF_AlyaPaymentAttempts_UpdatedAt DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_AlyaPaymentAttempts_Order FOREIGN KEY(OrderId) REFERENCES dbo.AlyaOrders(Id) ON DELETE CASCADE,
  CONSTRAINT UQ_AlyaPaymentAttempts_Reference UNIQUE(Reference)
 );
 CREATE INDEX IX_AlyaPaymentAttempts_Order ON dbo.AlyaPaymentAttempts(OrderId,CreatedAt DESC);
END;
GO
