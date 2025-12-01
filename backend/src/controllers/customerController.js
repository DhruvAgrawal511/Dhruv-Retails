const prisma = require('../prismaClient');
const shopify = require('../services/shopifyService');

exports.syncCustomers = async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId);
    if (!tenantId) return res.status(400).json({ error: "tenantId missing" });

    const response = await shopify.get('customers.json');
    const customers = response.data.customers;

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
          tenantId,
        },
        create: {
          shopifyId: String(c.id),
          firstName: c.first_name || "",
          lastName: c.last_name || "",
          email: c.email || "",
          phone: c.phone || "",
          city: c.default_address?.city || "",
          tags: c.tags || "",
          tenantId,
        },
      })
    );

    await Promise.all(ops);

    return res.json({
      success: true,
      message: "Customers synced successfully",
      count: customers.length,
    });

  } catch (err) {
    console.error("Customer Sync Error:", err.response?.data || err);
    return res.status(500).json({ error: "Failed to sync customers" });
  }
};
