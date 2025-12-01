const prisma = require('../prismaClient');

exports.createEvent = async (req, res) => {
  try {
    const tenantId = parseInt(req.body.tenantId);
    const { type, customerShopifyId, payload } = req.body;

    if (!tenantId || !type) {
      return res.status(400).json({ error: "tenantId and type are required" });
    }

    let customerId = null;
    if (customerShopifyId) {
      const customer = await prisma.customer.findUnique({
        where: { shopifyId: String(customerShopifyId) }
      });
      if (customer) customerId = customer.id;
    }

    const event = await prisma.event.create({
      data: {
        tenantId,
        type,
        customerId,
        payload: payload ? JSON.stringify(payload) : null
      }
    });

    return res.status(201).json({ message: "Event logged", event });
  } catch (err) {
    console.error("Create Event Error:", err);
    return res.status(500).json({ error: "Failed to create event" });
  }
};
