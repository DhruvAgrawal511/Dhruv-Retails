const prisma = require('../prismaClient');
const { connection: redis } = require('../queue');

exports.getSummary = async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId);
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId missing" });
    }

    const cacheKey = `analytics:summary:${tenantId}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Redis get error:', e.message || e);
    }

    const [customerCount, orderCount, revenueAgg] = await Promise.all([
      prisma.customer.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.order.aggregate({ where: { tenantId }, _sum: { totalPrice: true } })
    ]);

    const totalRevenue = revenueAgg._sum.totalPrice || 0;

    const result = {
      totalCustomers: customerCount,
      totalOrders: orderCount,
      totalRevenue: Number(totalRevenue)
    };

    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
    } catch (e) {
      console.warn('Redis set error:', e.message || e);
    }

    return res.json(result);
  } catch (err) {
    console.error("Summary Analytics Error:", err);
    return res.status(500).json({ error: "Failed to load summary" });
  }
};

exports.getOrdersByDate = async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId);
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId missing" });
    }

    const start = req.query.start ? new Date(req.query.start) : null;
    const end = req.query.end ? new Date(req.query.end) : null;

    const dateFilter = {};
    if (start) dateFilter.gte = start;
    if (end) dateFilter.lte = end;

    const whereClause = { tenantId };

    if (start || end) {
      whereClause.analyticsDate = dateFilter;
    }

    const cacheKey = `analytics:ordersByDate:${tenantId}:${req.query.start || ''}:${req.query.end || ''}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Redis get error:', e.message || e);
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        analyticsDate: true,
        totalPrice: true
      },
      orderBy: {
        analyticsDate: 'asc'
      }
    });

    const byDate = {};

    for (const o of orders) {
      if (!o.analyticsDate) continue;
      const day = o.analyticsDate.toISOString().slice(0, 10);
      if (!byDate[day]) {
        byDate[day] = {
          date: day,
          orderCount: 0,
          totalRevenue: 0
        };
      }
      byDate[day].orderCount += 1;
      byDate[day].totalRevenue += Number(o.totalPrice || 0);
    }

    const result = Object.values(byDate);
    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
    } catch (e) {
      console.warn('Redis set error:', e.message || e);
    }

    return res.json(result);
  } catch (err) {
    console.error("Orders-by-date Analytics Error:", err);
    return res.status(500).json({ error: "Failed to load orders by date" });
  }
};

exports.getTopCustomers = async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId);
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId missing" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const orders = await prisma.order.findMany({
      where: { tenantId, customerId: { not: null } },
      include: {
        customer: true
      }
    });
    const map = {};

    for (const o of orders) {
      if (!o.customer) continue;
      const cid = o.customerId;
      if (!map[cid]) {
        map[cid] = {
          customerId: cid,
          name: `${o.customer.firstName || ""} ${o.customer.lastName || ""}`.trim(),
          email: o.customer.email || "",
          totalSpend: 0,
          orderCount: 0
        };
      }
      map[cid].totalSpend += Number(o.totalPrice || 0);
      map[cid].orderCount += 1;
    }

    const list = Object.values(map);
    list.sort((a, b) => b.totalSpend - a.totalSpend);

    const top = list.slice(0, limit);
    return res.json(top);
  } catch (err) {
    console.error("Top Customers Analytics Error:", err);
    return res.status(500).json({ error: "Failed to load top customers" });
  }
};

exports.getAverageOrderValue = async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId);
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId missing" });
    }

    const [agg, count] = await Promise.all([
      prisma.order.aggregate({
        where: { tenantId },
        _sum: { totalPrice: true }
      }),
      prisma.order.count({
        where: { tenantId }
      })
    ]);

    const totalRevenue = Number(agg._sum.totalPrice || 0);
    const avg = count > 0 ? totalRevenue / count : 0;

    return res.json({
      averageOrderValue: avg,
      totalOrders: count,
      totalRevenue
    });
  } catch (err) {
    console.error("AOV Analytics Error:", err);
    return res.status(500).json({ error: "Failed to load average order value" });
  }
};

exports.getRepeatCustomers = async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId);
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId missing" });
    }

    const orders = await prisma.order.findMany({
      where: { tenantId, customerId: { not: null } },
      select: {
        customerId: true
      }
    });

    const counts = {};
    for (const o of orders) {
      const cid = o.customerId;
      if (!cid) continue;
      counts[cid] = (counts[cid] || 0) + 1;
    }

    const uniqueCustomers = Object.keys(counts).length;
    let repeat = 0;

    for (const cid in counts) {
      if (counts[cid] > 1) repeat++;
    }

    const repeatRate = uniqueCustomers > 0 ? repeat / uniqueCustomers : 0;

    return res.json({
      uniqueCustomers,
      repeatCustomers: repeat,
      repeatRate
    });
  } catch (err) {
    console.error("Repeat Customers Analytics Error:", err);
    return res.status(500).json({ error: "Failed to load repeat customers" });
  }
};
