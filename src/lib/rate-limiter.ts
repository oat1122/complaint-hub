interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

export class RateLimiter {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private windowMs: number;
  private max: number;
  
  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  async check(key: string): Promise<void> {
    const now = Date.now();
    const record = this.store.get(key);
    
    if (!record || record.resetTime < now) {
      this.store.set(key, { count: 1, resetTime: now + this.windowMs });
      return;
    }
    
    if (record.count >= this.max) {
      throw new Error('Rate limit exceeded');
    }
    
    record.count++;
  }
  
  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (record.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}
