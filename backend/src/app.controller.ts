import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo(): { name: string; status: string } {
    return {
      name: 'UniSwap API',
      status: 'ok',
    };
  }
}
