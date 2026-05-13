import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { RespuestaApi } from '../../../common/interfaces/respuesta-api.interface';
import { respuestaExitosa } from '../../../common/helpers/respuesta-api.helper';
import { Publico } from '../../../common/decorators/publico.decorator';
import { AuthServicio, DatosLoginRespuesta } from './auth.servicio';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsuarioActual } from './decorators/usuario-actual.decorador';
import { UsuarioJwt } from './types/usuario-jwt.interfaz';

@Controller('auth')
export class AuthControlador {
  constructor(private readonly authServicio: AuthServicio) {}

  @Publico()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<RespuestaApi<DatosLoginRespuesta>> {
    const resultado = await this.authServicio.login(
      dto,
      req.ip,
      req.headers['user-agent'],
    );
    return respuestaExitosa(resultado, 'Inicio de sesión exitoso');
  }

  @Publico()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<RespuestaApi<{ accessToken: string; refreshToken: string }>> {
    const resultado = await this.authServicio.refresh(dto);
    return respuestaExitosa(resultado, 'Tokens renovados');
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * Requiere token de acceso válido — no se usa @Publico().
   */
  @Post('cambiar-password')
  @HttpCode(HttpStatus.OK)
  async cambiarPassword(
    @Body() dto: CambiarPasswordDto,
    @UsuarioActual() usuario: UsuarioJwt,
    @Req() req: Request,
  ): Promise<RespuestaApi<null>> {
    await this.authServicio.cambiarPassword(
      usuario.sub,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
    return respuestaExitosa(null, 'Contraseña actualizada correctamente');
  }
}
