'use strict';

const now = () => new Date().toISOString();

const plans = [
  { code: 'free', monthly: 0, yearly: 0, limits: { users: 2, orders: 250, storageGb: 1 } },
  { code: 'basic', monthly: 49, yearly: 470, limits: { users: 5, orders: 2000, storageGb: 10 } },
  { code: 'pro', monthly: 99, yearly: 950, limits: { users: 20, orders: 10000, storageGb: 50 } },
  { code: 'business', monthly: 249, yearly: 2390, limits: { users: 100, orders: 100000, storageGb: 300 } },
  { code: 'enterprise', monthly: 599, yearly: 5750, limits: { users: 1000, orders: 1000000, storageGb: 2000 } },
];

const yearlySavings = (planCode) => {
  const plan = plans.find((p) => p.code === planCode);
  if (!plan || plan.monthly === 0) return 0;
  const annualizedMonthly = plan.monthly * 12;
  return Math.round(((annualizedMonthly - plan.yearly) / annualizedMonthly) * 100);
};

const calcHealthScore = ({ ordersGrowth, failedPayments, activeUsers }) => {
  const score = Math.max(0, Math.min(100, 50 + ordersGrowth * 20 - failedPayments * 10 + activeUsers));
  let risk = 'low';
  if (score < 40) risk = 'high';
  else if (score < 65) risk = 'medium';
  return { score, risk };
};

const recommendActions = (tenant) => {
  const recs = [];
  if (tenant.subscriptionStatus === 'past_due') recs.push('Trigger dunning campaign and card update reminder.');
  if (tenant.plan === 'basic' && tenant.monthlyOrders > 1600) recs.push('Offer Pro plan upsell with automation bundle.');
  if (tenant.healthRisk === 'high') recs.push('Assign CSM outreach and enable churn-prevention email flow.');
  return recs.length ? recs : ['No urgent actions. Keep monitoring weekly trends.'];
};

class BackofficeService {
  getDashboardOverview() {
    return {
      generatedAt: now(),
      kpis: {
        mrr: 168540,
        arr: 2022480,
        activeSubscriptions: 1408,
        newCustomers: 88,
        churnedCustomers: 19,
        failedPayments: 14,
        activeRestaurants: 1372,
        inactiveRestaurants: 81,
      },
      charts: {
        revenueTrend: [120000, 129000, 136500, 150200, 158900, 168540],
        subscriptionsByPlan: [130, 510, 560, 150, 58],
        churnVsNew: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], churn: [14, 18, 15, 19], new: [72, 81, 90, 88] },
      },
      alerts: [
        { level: 'critical', title: 'Payment gateway timeout spike', createdAt: now() },
        { level: 'warning', title: 'Background jobs queue > 30s delay', createdAt: now() },
      ],
    };
  }

  listTenants({ page = 1, limit = 20, plan, status, region }) {
    const rows = Array.from({ length: limit }).map((_, idx) => {
      const n = (page - 1) * limit + idx + 1;
      const ordersGrowth = ((n % 8) - 3) / 10;
      const base = {
        id: n,
        businessName: `Restaurant ${n}`,
        subdomain: `rest-${n}`,
        plan: plan || ['free', 'basic', 'pro', 'business', 'enterprise'][n % 5],
        status: status || ['active', 'trial', 'suspended', 'cancelled'][n % 4],
        createdAt: new Date(Date.now() - n * 86400000).toISOString(),
        region: region || ['US', 'EU', 'MENA'][n % 3],
        monthlyOrders: 400 + n * 17,
        subscriptionStatus: ['trial', 'active', 'past_due', 'canceled'][n % 4],
      };
      const health = calcHealthScore({ ordersGrowth, failedPayments: n % 3, activeUsers: n % 15 });
      return {
        ...base,
        healthScore: health.score,
        healthRisk: health.risk,
        aiRecommendations: recommendActions({ ...base, ...health }),
      };
    });

    return {
      page,
      limit,
      total: 1500,
      rows,
    };
  }

  getTenantDetail(id) {
    const tenant = this.listTenants({ page: 1, limit: 1 }).rows[0];
    return {
      ...tenant,
      id: Number(id),
      profile: {
        ownerEmail: `owner${id}@restaurant.com`,
        phone: '+1-202-555-0131',
        timezone: 'America/New_York',
      },
      metrics: {
        orders30d: 1200,
        revenue30d: 16200,
        activeUsers: 18,
        apiCalls30d: 98000,
      },
      billingHistory: [
        { invoiceNumber: `INV-${id}-001`, status: 'paid', amount: 249, issuedAt: now() },
        { invoiceNumber: `INV-${id}-002`, status: 'failed', amount: 249, issuedAt: now() },
      ],
      activityLogs: [
        { actor: 'admin@orderlify.com', action: 'plan_changed', at: now() },
        { actor: 'system', action: 'billing_retry', at: now() },
      ],
      benchmarks: {
        revenuePercentile: 78,
        retentionPercentile: 72,
        orderVolumePercentile: 69,
      },
    };
  }

  getPlans() {
    return plans.map((p) => ({ ...p, yearlySavingsPercent: yearlySavings(p.code) }));
  }

  getAnalytics(filters) {
    return {
      filters,
      totalRevenue: 1450982,
      averageOrderValue: 22.47,
      retentionRate: 0.91,
      peakHoursUtc: ['11:00', '12:00', '13:00', '19:00'],
      topRestaurants: [
        { tenantId: 41, name: 'Sakura Hub', revenue: 78000 },
        { tenantId: 15, name: 'Spice District', revenue: 65410 },
      ],
      conversionFreeToPaid: 0.24,
    };
  }

  listTickets({ page = 1, limit = 20 }) {
    return {
      page,
      limit,
      total: 293,
      rows: Array.from({ length: limit }).map((_, i) => ({
        id: `TCK-${page}-${i + 1}`,
        customer: `Tenant ${i + 1}`,
        priority: ['low', 'medium', 'high', 'urgent'][i % 4],
        status: ['open', 'pending', 'solved'][i % 3],
        category: ['billing', 'technical', 'feature_request'][i % 3],
      })),
    };
  }

  getSystemConfiguration() {
    return {
      featureFlags: {
        smartMenu: true,
        aiForecasting: false,
        globalCoupons: true,
      },
      limitsByPlan: Object.fromEntries(plans.map((p) => [p.code, p.limits])),
      integrations: {
        payments: 'stripe',
        email: 'sendgrid',
        sms: 'twilio',
      },
    };
  }

  getMonitoring() {
    return {
      services: {
        api: { status: 'up', p95Ms: 120 },
        database: { status: 'up', replicationLagMs: 22 },
        websocket: { status: 'degraded', reconnectRate: 0.07 },
      },
      logs: {
        errorsLastHour: 9,
        requestsLastHour: 42800,
        webhookFailuresLastHour: 2,
      },
    };
  }

  getMarketing() {
    return {
      coupons: [{ code: 'GROWTH20', discount: 20, active: true }],
      campaigns: [{ name: 'Winback April', audience: 'churn-risk-high', delivered: 820 }],
      segmentation: ['plan', 'activity', 'region'],
      conversionTracking: { freeToPaidRate: 0.24, trialToPaidRate: 0.52 },
    };
  }

  getSecurity() {
    return {
      roles: ['admin', 'support', 'finance'],
      permissions: {
        admin: ['*'],
        support: ['tickets:read', 'tickets:write', 'tenants:read'],
        finance: ['billing:read', 'billing:write', 'reports:read'],
      },
      twoFactor: { enforcedForAdmins: true, optionalForSupport: true },
      auditLogs: [{ action: 'tenant.suspend', actor: 'admin@orderlify.com', at: now() }],
    };
  }

  getReports() {
    return {
      supportedFormats: ['pdf', 'xlsx', 'csv'],
      catalog: ['financial', 'customer', 'growth', 'churn'],
    };
  }

  getAutomations() {
    return {
      rules: [
        { key: 'auto_suspend_failed_payments', enabled: true, threshold: 3 },
        { key: 'inactive_user_detection', enabled: true, inactiveDays: 21 },
        { key: 'upsell_trigger_basic_high_usage', enabled: true, orderThreshold: 1600 },
      ],
      triggers: ['email', 'webhook', 'internal_notification'],
    };
  }
}

module.exports = new BackofficeService();
