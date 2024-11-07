import { ThrottlerModule } from '@nestjs/throttler';

export const throttlerConfig = ThrottlerModule.forRoot([
  {
    ttl: 60000, // 1 min
    limit: 15,
  },
]);
