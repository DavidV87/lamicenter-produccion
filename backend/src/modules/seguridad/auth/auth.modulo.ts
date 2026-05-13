import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthControlador } from './auth.controlador';
import { AuthServicio } from './auth.servicio';
import { JwtEstrategia } from './strategies/jwt.estrategia';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        // @nestjs/jwt v11 usa StringValue (branded string de ms) — cast requerido
        const expiresIn = (configService.get<string>('aplicacion.jwt.accessExpiresIn') ||
          '15m') as unknown as number;
        return {
          secret: configService.get<string>('aplicacion.jwt.accessSecret'),
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthControlador],
  providers: [AuthServicio, JwtEstrategia],
  exports: [AuthServicio, JwtModule],
})
export class AuthModulo {}
