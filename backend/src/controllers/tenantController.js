const prisma = require('../prismaClient');

exports.onboardTenant = async (req, res) => {
  try {
    const { name, shopifyStoreDomain, shopifyAccessToken } = req.body;

    if (!name || !shopifyStoreDomain || !shopifyAccessToken) {
      return res.status(400).json({ error: "name, shopifyStoreDomain and shopifyAccessToken are required" });
    }

    const existing = await prisma.tenant.findUnique({
      where: { shopifyStoreDomain }
    });

    if (existing) {
      return res.status(400).json({ error: "Tenant for this store domain already exists" });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        shopifyStoreDomain,
        shopifyAccessToken
      }
    });

    return res.status(201).json({
      message: "Tenant onboarded successfully",
      tenant
    });
  } catch (err) {
    console.error("Onboard Tenant Error:", err);
    return res.status(500).json({ error: "Failed to onboard tenant" });
  }
};
