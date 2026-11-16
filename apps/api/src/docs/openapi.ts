export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SI Coin Ecosystem Core API',
    version: '1.0.0',
    description:
      'Production-grade RESTful API for the SI Coin cryptocurrency platform, delivering transparent market telemetry, role-based administration, non-custodial wallet verification, and support ticketing.',
    contact: {
      name: 'SI Protocol Engineering Team',
      email: 'info@sicoin.org',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Primary v1 API mount',
    },
  ],
  paths: {
    '/coin/config': {
      get: {
        summary: 'Get public coin configuration',
        tags: ['Public Market'],
        responses: { 200: { description: 'Token metadata, supply metrics, and network info' } },
      },
    },
    '/coin/price': {
      get: {
        summary: 'Get active reference price and provenance',
        tags: ['Public Market'],
        responses: { 200: { description: 'Current price, 24h delta, provenance source, and timestamp' } },
      },
    },
    '/coin/price/history': {
      get: {
        summary: 'Get historical price observations',
        tags: ['Public Market'],
        parameters: [
          { name: 'range', in: 'query', schema: { type: 'string', enum: ['24H', '7D', '30D', '90D', '1Y', 'ALL'] } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'List of historical price snapshots' } },
      },
    },
    '/coin/calculator': {
      post: {
        summary: 'Decimal-accurate conversion calculator',
        tags: ['Public Market'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'string', example: '100' },
                  direction: { type: 'string', enum: ['USD_TO_SI', 'SI_TO_USD'] },
                },
                required: ['amount', 'direction'],
              },
            },
          },
        },
        responses: { 200: { description: 'Calculated conversion estimate with rate and legal disclaimer' } },
      },
    },
    '/coin/tokenomics': {
      get: {
        summary: 'Get verified tokenomics allocations',
        tags: ['Public Market'],
        responses: { 200: { description: 'Token distribution categories totaling 100% and vesting schedules' } },
      },
    },
    '/content/announcements': {
      get: {
        summary: 'List published announcements',
        tags: ['Content'],
        responses: { 200: { description: 'Active announcements' } },
      },
    },
    '/content/faq': {
      get: {
        summary: 'List published FAQs',
        tags: ['Content'],
        responses: { 200: { description: 'Categorized FAQs' } },
      },
    },
    '/content/roadmap': {
      get: {
        summary: 'List roadmap milestones',
        tags: ['Content'],
        responses: { 200: { description: 'Phase milestones with progress states' } },
      },
    },
    '/content/whitepaper': {
      get: {
        summary: 'Get whitepaper text and metadata',
        tags: ['Content'],
        responses: { 200: { description: 'Structured whitepaper content and download URL' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new user account',
        tags: ['Authentication'],
        responses: { 201: { description: 'Account created and session initialized' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Sign in with credentials',
        tags: ['Authentication'],
        responses: { 200: { description: 'Session created with HttpOnly cookie' } },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Sign out and revoke session',
        tags: ['Authentication'],
        responses: { 200: { description: 'Session invalidated' } },
      },
    },
    '/admin/overview': {
      get: {
        summary: 'Get administrator overview dashboard metrics',
        tags: ['Administration'],
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'System metrics and recent audit logs' } },
      },
    },
    '/admin/pricing/manual': {
      post: {
        summary: 'Publish or schedule manual reference price update',
        tags: ['Administration'],
        security: [{ cookieAuth: [] }],
        responses: { 201: { description: 'Price updated with audit log' } },
      },
    },
    '/admin/pricing/correct-record': {
      post: {
        summary: 'Correct a historical price observation with audit justification',
        tags: ['Administration'],
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Historical record corrected with preserved audit trail' } },
      },
    },
    '/admin/tokenomics': {
      put: {
        summary: 'Update tokenomics allocations (enforces 100% total)',
        tags: ['Administration'],
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Allocations updated' } },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sicoin_session',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
