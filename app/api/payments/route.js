import sql from 'mssql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let poolPromise = null;
const configured = () => Boolean(process.env.SQL_SERVER && process.env.SQL_DATABASE && process.env.SQL_USER && process.env.SQL_PASSWORD);
const envBool = (value, fallback = false) => value == null ? fallback : String(value).toLowerCase() === 'true';

async function pool() {
  if (!configured()) return null;
  if (!poolPromise) {
    poolPromise = sql.connect({
      server: process.env.SQL_SERVER,
      database: process.env.SQL_DATABASE,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      port: Number(process.env.SQL_PORT || 1433),
      options: {
        encrypt: envBool(process.env.SQL_ENCRYPT, false),
        trustServerCertificate: envBool(process.env.SQL_TRUST_SERVER_CERTIFICATE, true),
      },
    }).catch((error) => {
      poolPromise = null;
      throw error;
    });
  }
  return poolPromise;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const orderNo = String(body.orderNo || '').trim();
    const method = String(body.method || '').trim();

    if (!orderNo || !method) return Response.json({ error: 'orderNo ve method gerekli' }, { status: 400 });
    if (!['Kart', 'Havale/EFT'].includes(method)) return Response.json({ error: 'Geçersiz ödeme yöntemi' }, { status: 400 });

    const connection = await pool();
    if (!connection) {
      return Response.json({
        ok: true,
        source: 'file',
        paymentStatus: 'Bekliyor',
        provider: 'demo',
        message: 'SQL ödeme kaydı için bağlantı yapılandırılmamış.',
      });
    }

    const orderResult = await connection.request()
      .input('orderNo', sql.NVarChar(60), orderNo)
      .query('SELECT TOP 1 Id, Total, PaymentMethod, PaymentStatus FROM dbo.AlyaOrders WHERE OrderNo=@orderNo');

    if (!orderResult.recordset.length) return Response.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    const order = orderResult.recordset[0];

    if (order.PaymentMethod && String(order.PaymentMethod) !== method) {
      return Response.json({
        error: `Sipariş ödeme yöntemi ${order.PaymentMethod} olarak kayıtlı. Ödeme yöntemi değişikliği için sipariş yeniden oluşturulmalı.`,
      }, { status: 409 });
    }

    if (['Ödendi', 'Tamamlandı'].includes(String(order.PaymentStatus || ''))) {
      return Response.json({
        ok: true,
        source: 'sql',
        status: order.PaymentStatus,
        alreadyPaid: true,
        message: 'Bu sipariş için ödeme zaten tamamlanmış.',
      });
    }

    const pendingResult = await connection.request()
      .input('orderId', sql.BigInt, order.Id)
      .input('method', sql.NVarChar(60), method)
      .query("SELECT TOP 1 Reference, Provider, Status FROM dbo.AlyaPaymentAttempts WHERE OrderId=@orderId AND PaymentMethod=@method AND Status=N'Bekliyor' ORDER BY CreatedAt DESC");

    if (pendingResult.recordset.length) {
      const pending = pendingResult.recordset[0];
      return Response.json({
        ok: true,
        source: 'sql',
        reference: pending.Reference,
        provider: pending.Provider,
        status: pending.Status,
        reused: true,
        message: 'Bu sipariş için bekleyen ödeme kaydı zaten mevcut.',
      });
    }

    const reference = `PAY-${Date.now().toString(36).toUpperCase()}`;
    const provider = method === 'Havale/EFT' ? 'BankTransfer' : (process.env.PAYMENT_PROVIDER || 'NotConfigured');

    await connection.request()
      .input('orderId', sql.BigInt, order.Id)
      .input('reference', sql.NVarChar(100), reference)
      .input('provider', sql.NVarChar(60), provider)
      .input('method', sql.NVarChar(60), method)
      .input('amount', sql.Decimal(18, 2), Number(order.Total) || 0)
      .query("INSERT dbo.AlyaPaymentAttempts(OrderId,Reference,Provider,PaymentMethod,Amount,Status) VALUES(@orderId,@reference,@provider,@method,@amount,N'Bekliyor')");

    await connection.request()
      .input('orderNo', sql.NVarChar(60), orderNo)
      .input('provider', sql.NVarChar(50), provider)
      .input('reference', sql.NVarChar(120), reference)
      .query("UPDATE dbo.AlyaOrders SET PaymentProvider=@provider,PaymentReference=@reference,PaymentStatus=N'Bekliyor',UpdatedAt=SYSUTCDATETIME() WHERE OrderNo=@orderNo");

    return Response.json({
      ok: true,
      source: 'sql',
      reference,
      provider,
      status: 'Bekliyor',
      requiresProvider: provider === 'NotConfigured',
      message: provider === 'NotConfigured'
        ? 'Kart ödemesi için ödeme sağlayıcısı henüz yapılandırılmadı.'
        : method === 'Havale/EFT'
          ? 'Havale/EFT talimatı sipariş detayında gösterilebilir.'
          : 'Ödeme sağlayıcısına yönlendirme hazır.',
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Ödeme oturumu oluşturulamadı' }, { status: 409 });
  }
}
