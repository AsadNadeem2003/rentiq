import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: 'Rentiq API is running perfectly! 🚀',
      status: 'OK',
      documentation: 'Use /api/properties or /api/auth endpoints.',
    };
  }
}
