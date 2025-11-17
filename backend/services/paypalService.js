const paypal = require('@paypal/checkout-server-sdk');

let cachedClient = null;

function getEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environmentName = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();

  if (!clientId || !clientSecret) {
    throw new Error('Identifiants PayPal non configurés. Définissez PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET.');
  }

  if (environmentName === 'live' || environmentName === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function getClient() {
  if (!cachedClient) {
    cachedClient = new paypal.core.PayPalHttpClient(getEnvironment());
  }
  return cachedClient;
}

function getSupportedCurrencies() {
  return (process.env.PAYPAL_SUPPORTED_CURRENCIES || 'USD,EUR,GBP')
    .split(',')
    .map(currency => currency.trim().toUpperCase())
    .filter(Boolean);
}

function resolveCurrency(currency) {
  const supportedCurrencies = getSupportedCurrencies();
  const normalizedCurrency = (currency || '').toUpperCase();

  if (normalizedCurrency && supportedCurrencies.includes(normalizedCurrency)) {
    return normalizedCurrency;
  }

  const defaultCurrency = (process.env.PAYPAL_DEFAULT_CURRENCY || supportedCurrencies[0] || 'EUR').toUpperCase();

  if (!supportedCurrencies.includes(defaultCurrency)) {
    supportedCurrencies.push(defaultCurrency);
  }

  return defaultCurrency;
}

function formatAmount(value) {
  const amount = typeof value === 'number' ? value : Number(value || 0);
  return amount.toFixed(2);
}

function parseExchangeRates() {
  if (!process.env.PAYPAL_EXCHANGE_RATES) {
    return {};
  }

  try {
    const rates = JSON.parse(process.env.PAYPAL_EXCHANGE_RATES);
    return typeof rates === 'object' && rates !== null ? rates : {};
  } catch (error) {
    return {};
  }
}

function getExchangeRate(fromCurrency, toCurrency) {
  if (!fromCurrency || fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return 1;
  }

  const rates = parseExchangeRates();
  const directKey = `${fromCurrency.toUpperCase()}->${toCurrency.toUpperCase()}`;
  const altKey = `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;

  if (rates[directKey]) {
    return Number(rates[directKey]);
  }

  if (rates[altKey]) {
    return Number(rates[altKey]);
  }

  const envKey = `PAYPAL_RATE_${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
  if (process.env[envKey]) {
    return Number(process.env[envKey]);
  }

  const fallback = Number(process.env.PAYPAL_DEFAULT_EXCHANGE_RATE || 1);
  return fallback || 1;
}

function normalizeAmount(value, fromCurrency, toCurrency) {
  const rate = getExchangeRate(fromCurrency, toCurrency);
  const baseAmount = Number(value || 0) * rate;
  return {
    convertedAmount: formatAmount(baseAmount),
    exchangeRate: rate
  };
}

async function createOrder({ amount, currency, reference, returnUrl, cancelUrl }) {
  const paypalCurrency = resolveCurrency(currency);
  const client = getClient();

  const { convertedAmount, exchangeRate } = normalizeAmount(amount, currency, paypalCurrency);

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: reference,
        amount: {
          currency_code: paypalCurrency,
          value: convertedAmount
        }
      }
    ],
    application_context: {
      return_url: returnUrl || process.env.PAYPAL_RETURN_URL || '',
      cancel_url: cancelUrl || process.env.PAYPAL_CANCEL_URL || ''
    }
  });

  const response = await client.execute(request);
  const approvalLink = response.result.links?.find(link => link.rel === 'approve');

  return {
    id: response.result.id,
    status: response.result.status,
    amount: response.result.purchase_units?.[0]?.amount?.value,
    currency: response.result.purchase_units?.[0]?.amount?.currency_code,
    approvalUrl: approvalLink?.href,
    raw: response.result,
    exchangeRate,
    originalAmount: formatAmount(amount),
    originalCurrency: (currency || paypalCurrency).toUpperCase()
  };
}

// Créer un ordre PayPal pour les Hosted Fields (sans return_url/cancel_url)
async function createOrderForHostedFields({ amount, currency, reference }) {
  const paypalCurrency = resolveCurrency(currency);
  const client = getClient();

  const { convertedAmount, exchangeRate } = normalizeAmount(amount, currency, paypalCurrency);

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: reference,
        amount: {
          currency_code: paypalCurrency,
          value: convertedAmount
        }
      }
    ],
    application_context: {
      shipping_preference: 'NO_SHIPPING',
      landing_page: 'BILLING'
      // IMPORTANT: Pas de return_url ni cancel_url pour éviter la redirection
      // Les Hosted Fields gèrent le paiement directement dans la modale
    }
  });

  const response = await client.execute(request);

  return {
    id: response.result.id,
    status: response.result.status,
    amount: response.result.purchase_units?.[0]?.amount?.value,
    currency: response.result.purchase_units?.[0]?.amount?.currency_code,
    raw: response.result,
    exchangeRate,
    originalAmount: formatAmount(amount),
    originalCurrency: (currency || paypalCurrency).toUpperCase()
  };
}

async function captureOrder(orderId) {
  const client = getClient();
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  const response = await client.execute(request);
  return response.result;
}

async function verifyWebhook(headers, body) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    // Si aucun webhook ID n'est configuré, on rejette la requête pour éviter les faux positifs
    return false;
  }

  const transmissionId = headers['paypal-transmission-id'];
  const transmissionTime = headers['paypal-transmission-time'];
  const certUrl = headers['paypal-cert-url'];
  const authAlgo = headers['paypal-auth-algo'];
  const transmissionSig = headers['paypal-transmission-sig'];

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  const client = getClient();
  const request = new paypal.notifications.VerifyWebhookSignatureRequest();
  request.requestBody({
    auth_algo: authAlgo,
    cert_url: certUrl,
    transmission_id: transmissionId,
    transmission_sig: transmissionSig,
    transmission_time: transmissionTime,
    webhook_id: webhookId,
    webhook_event: body
  });

  try {
    const response = await client.execute(request);
    return response.result?.verification_status === 'SUCCESS';
  } catch (error) {
    return false;
  }
}

async function generateClientToken({ customerId } = {}) {
  try {
    const client = getClient();
    const environment = getEnvironment();
    
    // Créer une requête HTTP brute pour générer le client token
    // Le SDK PayPal ne fournit pas de classe spécifique pour cet endpoint
    const request = {
      path: '/v1/identity/generate-token',
      verb: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: customerId ? { customer_id: customerId } : {}
    };

    const response = await client.execute(request);
    
    // Le client token peut être dans différents champs selon la réponse
    return response.result?.client_token || 
           response.result?.clientToken || 
           response.result?.data?.client_token ||
           null;
  } catch (error) {
    console.error('Erreur lors de la génération du client token PayPal:', error);
    // Log plus de détails pour le debug
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    if (error.message) {
      console.error('Message:', error.message);
    }
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
    throw new Error(`Impossible de générer le token client PayPal: ${error.message || 'Erreur inconnue'}`);
  }
}

module.exports = {
  createOrder,
  createOrderForHostedFields,
  captureOrder,
  verifyWebhook,
  resolveCurrency,
  generateClientToken
};

