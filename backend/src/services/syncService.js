const prisma = require('../prismaClient');
const shopify = require('./shopifyService');

async function syncProductsForTenant(tenant) {
  const response = await shopify.get('products.json');
  const products = response.data.products || [];

  const ops = products.map((p) =>
    prisma.product.upsert({
      where: { shopifyId: String(p.id) },
      update: {
        title: p.title,
        description: p.body_html || "",
        price: p.variants?.[0]?.price ? parseFloat(p.variants[0].price) : null,
        currency: p.variants?.[0]?.currency || "INR",
        imageUrl: p.image?.src || null,
        tenantId: tenant.id
      },
      create: {
        shopifyId: String(p.id),
        title: p.title,
        description: p.body_html || "",
        price: p.variants?.[0]?.price ? parseFloat(p.variants[0].price) : null,
        currency: p.variants?.[0]?.currency || "INR",
        imageUrl: p.image?.src || null,
        tenantId: tenant.id
      }
    })
  );

  await Promise.all(ops);
}

async function syncCustomersForTenant(tenant) {
  const response = await shopify.get('customers.json');
  const customers = response.data.customers || [];

  const ops = customers.map((c) =>
    prisma.customer.upsert({
      where: { shopifyId: String(c.id) },
      update: {
        firstName: c.first_name || "",
        lastName: c.last_name || "",
        email: c.email || "",
        phone: c.phone || "",
        city: c.default_address?.city || "",
        tags: c.tags || "",
        tenantId: tenant.id
      },
      create: {
        shopifyId: String(c.id),
        firstName: c.first_name || "",
        lastName: c.last_name || "",
        email: c.email || "",
        phone: c.phone || "",
        city: c.default_address?.city || "",
        tags: c.tags || "",
        tenantId: tenant.id
      }
    })
  );

  await Promise.all(ops);
}

async function syncOrdersForTenant(tenant) {
  const response = await shopify.get('orders.json', {
    params: { status: 'any' }
  });

  const orders = response.data.orders || [];

  for (const o of orders) {
    let customerId = null;
    if (o.customer && o.customer.id) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { shopifyId: String(o.customer.id) }
      });
      if (existingCustomer) customerId = existingCustomer.id;
    }

    const shopifyCreatedAt = o.created_at ? new Date(o.created_at) : null;

    const orderRecord = await prisma.order.upsert({
      where: { shopifyId: String(o.id) },
      update: {
        orderNumber: o.name || String(o.order_number || ''),
        customerId,
        totalPrice: o.total_price ? parseFloat(o.total_price) : null,
        currency: o.currency || "INR",
        shopifyCreatedAt,
        analyticsDate: shopifyCreatedAt,
        financialStatus: o.financial_status || '',
        fulfillmentStatus: o.fulfillment_status || '',
        tenantId: tenant.id
      },
      create: {
        shopifyId: String(o.id),
        orderNumber: o.name || String(o.order_number || ''),
        customerId,
        totalPrice: o.total_price ? parseFloat(o.total_price) : null,
        currency: o.currency || "INR",
        shopifyCreatedAt,
        analyticsDate: shopifyCreatedAt,
        financialStatus: o.financial_status || '',
        fulfillmentStatus: o.fulfillment_status || '',
        tenantId: tenant.id
      }
    });

    await prisma.orderItem.deleteMany({
      where: { orderId: orderRecord.id }
    });

    for (const li of (o.line_items || [])) {
      let productId = null;
      if (li.product_id) {
        const product = await prisma.product.findUnique({
          where: { shopifyId: String(li.product_id) }
        });
        if (product) productId = product.id;
      }

      await prisma.orderItem.create({
        data: {
          tenantId: tenant.id,
          orderId: orderRecord.id,
          productId,
          shopifyLineId: String(li.id),
          quantity: li.quantity || 0,
          price: li.price ? parseFloat(li.price) : null
        }
      });
    }
  }
}

async function syncAllTenants() {
  const tenants = await prisma.tenant.findMany();
  for (const tenant of tenants) {
    console.log(`Syncing tenant: ${tenant.name} (${tenant.shopifyStoreDomain})`);
    await syncProductsForTenant(tenant);
    await syncCustomersForTenant(tenant);
    await syncOrdersForTenant(tenant);
  }
}

module.exports = {
  syncAllTenants,
  syncProductsForTenant,
  syncCustomersForTenant,
  syncOrdersForTenant
};
