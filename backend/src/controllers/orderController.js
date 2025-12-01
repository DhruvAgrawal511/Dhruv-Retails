const prisma = require('../prismaClient');
const shopify = require('../services/shopifyService');

exports.syncOrders = async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId);
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId missing" });
    }
    const response = await shopify.get('orders.json', {
      params: {
        status: 'any'
      }
    });

    const orders = response.data.orders || [];

    for (const o of orders) {
      let customerId = null;
      if (o.customer && o.customer.id) {
        const existingCustomer = await prisma.customer.findUnique({
          where: { shopifyId: String(o.customer.id) }
        });
        if (existingCustomer) {
          customerId = existingCustomer.id;
        }
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
          analyticsDate: shopifyCreatedAt, // can later be randomized for charts
          financialStatus: o.financial_status || '',
          fulfillmentStatus: o.fulfillment_status || '',
          tenantId
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
          tenantId
        }
      });

      await prisma.orderItem.deleteMany({
        where: {
          orderId: orderRecord.id
        }
      });

      const lineItems = o.line_items || [];
      for (const li of lineItems) {
        let productId = null;
        if (li.product_id) {
          const productRecord = await prisma.product.findUnique({
            where: { shopifyId: String(li.product_id) }
          });
          if (productRecord) {
            productId = productRecord.id;
          }
        }

        await prisma.orderItem.create({
          data: {
            tenantId,
            orderId: orderRecord.id,
            productId,
            shopifyLineId: String(li.id),
            quantity: li.quantity || 0,
            price: li.price ? parseFloat(li.price) : null
          }
        });
      }
    }

    return res.json({
      success: true,
      message: "Orders synced successfully",
      count: orders.length
    });
  } catch (err) {
    console.error("Order Sync Error:", err.response?.data || err);
    return res.status(500).json({ error: "Failed to sync orders" });
  }
};
