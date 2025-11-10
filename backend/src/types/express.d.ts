import { User } from '@prisma/client';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: User & { role?: string };
    }
  }
}

declare global {
  namespace Express {
    interface User {
      userId: number;
      email: string;
      username: string;
    }

    interface Request {
      user?: User;
    }
  }
}
