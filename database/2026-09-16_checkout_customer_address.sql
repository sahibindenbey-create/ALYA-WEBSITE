/* ALYA HOMES - Checkout customer/address expansion
   Safe, repeatable migration. Existing data is preserved.
*/

IF COL_LENGTH('dbo.AlyaCustomers','CustomerType') IS NULL
    ALTER TABLE dbo.AlyaCustomers ADD CustomerType NVARCHAR(20) NULL;

IF COL_LENGTH('dbo.AlyaCustomers','CompanyName') IS NULL
    ALTER TABLE dbo.AlyaCustomers ADD CompanyName NVARCHAR(250) NULL;

IF COL_LENGTH('dbo.AlyaCustomers','TaxNumber') IS NULL
    ALTER TABLE dbo.AlyaCustomers ADD TaxNumber NVARCHAR(50) NULL;

IF COL_LENGTH('dbo.AlyaCustomers','TaxOffice') IS NULL
    ALTER TABLE dbo.AlyaCustomers ADD TaxOffice NVARCHAR(150) NULL;

IF COL_LENGTH('dbo.AlyaCustomers','IdentityNumber') IS NULL
    ALTER TABLE dbo.AlyaCustomers ADD IdentityNumber NVARCHAR(20) NULL;

IF COL_LENGTH('dbo.AlyaOrders','CustomerType') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD CustomerType NVARCHAR(20) NULL;

IF COL_LENGTH('dbo.AlyaOrders','CompanyName') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD CompanyName NVARCHAR(250) NULL;

IF COL_LENGTH('dbo.AlyaOrders','TaxNumber') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD TaxNumber NVARCHAR(50) NULL;

IF COL_LENGTH('dbo.AlyaOrders','TaxOffice') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD TaxOffice NVARCHAR(150) NULL;

IF COL_LENGTH('dbo.AlyaOrders','IdentityNumber') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD IdentityNumber NVARCHAR(20) NULL;

IF COL_LENGTH('dbo.AlyaOrders','BillingAddressJson') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD BillingAddressJson NVARCHAR(MAX) NULL;

IF COL_LENGTH('dbo.AlyaOrders','ShippingAddressJson') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD ShippingAddressJson NVARCHAR(MAX) NULL;

IF COL_LENGTH('dbo.AlyaOrders','SameAddress') IS NULL
    ALTER TABLE dbo.AlyaOrders ADD SameAddress BIT NULL;

UPDATE dbo.AlyaCustomers
SET CustomerType = COALESCE(CustomerType, N'Bireysel')
WHERE CustomerType IS NULL;

UPDATE dbo.AlyaOrders
SET CustomerType = COALESCE(CustomerType, N'Bireysel')
WHERE CustomerType IS NULL;

PRINT N'ALYA checkout müşteri/fatura/sevk alanları hazır.';
