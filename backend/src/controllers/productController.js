const prisma = require('../prismaClient');
const shopify = require('../services/shopifyService');

exports.syncProducts = async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId);
    if (!tenantId) return res.status(400).json({ error: "tenantId missing" });

    const response = await shopify.get('products.json');
    const products = response.data.products;

    const operations = products.map((p) =>
      prisma.product.upsert({
        where: { shopifyId: String(p.id) },
        update: {
          title: p.title,
          description: p.body_html || "",
          price: p.variants?.[0]?.price
            ? parseFloat(p.variants[0].price)
            : null,
          currency: p.variants?.[0]?.currency || "INR",
          imageUrl: p.image?.src || null,
          tenantId,
        },
        create: {
          shopifyId: String(p.id),
          title: p.title,
          description: p.body_html || "",
          price: p.variants?.[0]?.price
            ? parseFloat(p.variants[0].price)
            : null,
          currency: p.variants?.[0]?.currency || "INR",
          imageUrl: p.image?.src || null,
          tenantId,
        },
      })
    );

    await Promise.all(operations);

    return res.json({
      success: true,
      message: "Products synced successfully",
      count: products.length,
    });

  } catch (err) {
    console.error("Product Sync Error:", err.response?.data || err);
    return res.status(500).json({ error: "Failed to sync products" });
  }
};
