/* ALYA HOMES mağaza merkezi veri tabanı katmanı */
IF OBJECT_ID('dbo.AlyaStoreState','U') IS NULL
BEGIN
    CREATE TABLE dbo.AlyaStoreState (
        Id int NOT NULL CONSTRAINT PK_AlyaStoreState PRIMARY KEY,
        Payload nvarchar(max) NOT NULL,
        UpdatedAt datetime2(0) NOT NULL CONSTRAINT DF_AlyaStoreState_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_AlyaStoreState_Json CHECK (ISJSON(Payload)=1)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.AlyaStoreState WHERE Id=1)
BEGIN
    INSERT INTO dbo.AlyaStoreState(Id, Payload) VALUES
    (1, N'{"orders":[],"productOverrides":{},"customProducts":[],"deletedProducts":[]}');
END;
GO

/* Gelecekte normalize edilecek ürün/sipariş tabloları için temel audit alanı. */
IF OBJECT_ID('dbo.AlyaStoreAudit','U') IS NULL
BEGIN
    CREATE TABLE dbo.AlyaStoreAudit (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AlyaStoreAudit PRIMARY KEY,
        ActionName nvarchar(50) NOT NULL,
        Payload nvarchar(max) NULL,
        CreatedAt datetime2(0) NOT NULL CONSTRAINT DF_AlyaStoreAudit_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_AlyaStoreAudit_Json CHECK (Payload IS NULL OR ISJSON(Payload)=1)
    );
END;
GO
