import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    const reflector = {} as Reflector; // Mock or provide a Reflector instance
    expect(new JwtAuthGuard(reflector)).toBeDefined();
  });
});