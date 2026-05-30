import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TipoIdentificacion } from '@prisma/client';

export class FilaClienteDto {
  @IsString()
  @IsNotEmpty({ message: 'razonSocial es requerido' })
  @MaxLength(200)
  razonSocial!: string;

  @IsString()
  @IsNotEmpty({ message: 'identificacion es requerida' })
  @MaxLength(30)
  identificacion!: string;

  @IsEnum(TipoIdentificacion, {
    message: `tipoIdentificacion debe ser uno de: ${Object.values(TipoIdentificacion).join(', ')}`,
  })
  tipoIdentificacion!: TipoIdentificacion;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreComercial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'correo debe tener formato válido' })
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
