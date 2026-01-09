import { z } from 'zod';
import { insertUserSchema, insertMessageSchema, users, messages, intelLinks, loginSchema, friends } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: loginSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: { 200: z.object({ success: z.boolean() }) },
    },
  },
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/users/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    search: {
      method: 'GET' as const,
      path: '/api/users/search',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/me',
      input: insertUserSchema.partial().omit({ username: true, password: true }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  friends: {
    list: {
      method: 'GET' as const,
      path: '/api/friends',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect & { friendStatus: string }>()),
      }
    },
    request: {
      method: 'POST' as const,
      path: '/api/friends/request',
      input: z.object({ username: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
      }
    },
    accept: {
      method: 'POST' as const,
      path: '/api/friends/accept',
      input: z.object({ friendId: z.number() }),
      responses: {
        200: z.object({ success: z.boolean() }),
      }
    }
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/messages',
      responses: { 200: z.array(z.custom<any>()) },
    },
    send: {
      method: 'POST' as const,
      path: '/api/messages',
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/messages/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/messages/:id',
      input: z.object({ content: z.string().min(1) }),
      responses: {
        200: z.custom<typeof messages.$inferSelect>(),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  intel: {
    list: {
      method: 'GET' as const,
      path: '/api/intel',
      responses: { 200: z.array(z.custom<typeof intelLinks.$inferSelect>()) },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
