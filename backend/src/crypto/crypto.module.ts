import { Module, Global } from '@nestjs/common';
import { CryptoService } from './crypto.service';

/**
 * CryptoModule is marked @Global so CryptoService can be injected
 * anywhere in the app without importing CryptoModule in every feature module.
 */
@Global()
@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
