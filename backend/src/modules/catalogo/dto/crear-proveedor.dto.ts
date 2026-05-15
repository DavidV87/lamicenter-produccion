import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TipoIdentificacion, TipoProveedor } from '@prisma/client';

export class CrearProveedorDto {
  @IsString()
  @MaxLength(200)
  razonSocial!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreComercial?: string;

  @IsString()
  @MaxLength(30)
  identificacion!: string;

  @IsEnum(TipoIdentificacion)
  tipoIdentificacion!: TipoIdentificacion;

  @IsEnum(TipoProveedor)
  tipoProveedor!: TipoProveedor;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  correo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;
}
