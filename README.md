# ALYA HOMES Store V22

V22 adds a production-oriented payment and shipping boundary without storing card data.

## New
- `POST /api/payments` creates a SQL payment attempt.
- Card payments use a provider adapter boundary; no raw card data is accepted or stored.
- `POST /api/shipping` calculates shipping from environment-configured threshold/fee.
- `/checkout/payment?order=...` payment handoff screen.
- `sql/008_alya_payment_attempts.sql` adds payment-attempt persistence.

## Environment
Optional:
- `PAYMENT_PROVIDER` = configured provider name
- `FREE_SHIPPING_THRESHOLD` = 1000
- `STANDARD_SHIPPING_FEE` = 99
- `DEFAULT_CARRIER` = carrier label

A real payment provider still requires the provider's merchant credentials and hosted/redirect API contract. The project deliberately does not collect or persist raw card numbers, CVV, or expiry data.

## V23 - Production checkout hardening
- `/api/health` provides deployment health/configuration visibility.
- Cart prevents quantities above known stock and exposes `validateCart()`.
- SQL migration `009_alya_checkout_hardening.sql` adds payment provider/reference and a unique checkout token to orders.
- No payment provider is falsely marked as active; configure the chosen provider before enabling real card payments.

## V24 - Payment callback / verification
- `POST /api/payments/webhook` accepts provider callbacks only when `x-alya-signature` matches HMAC-SHA256 using `PAYMENT_WEBHOOK_SECRET`.
- `GET /api/payments/verify?reference=...` returns the current payment attempt and order payment status.
- Payment provider/reference are written to `AlyaOrders` when a payment attempt is created.
- No raw card data is stored.
- Apply `sql/010_alya_payment_webhook.sql` after the previous migrations.


## V25 güvenlik
Yönetim paneli artık HttpOnly cookie tabanlı giriş ile korunur. `ADMIN_USERNAME`, `ADMIN_PASSWORD` ve `ADMIN_SESSION_SECRET` değerlerini production ortamında güçlü değerlerle ayarlayın.
