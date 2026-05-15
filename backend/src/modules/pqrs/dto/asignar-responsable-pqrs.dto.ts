import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { RolResponsablePqrs } from '@prisma/client';

export class AsignarResponsablePqrsDto {
  @IsUUID()
  @IsNotEmpty()
  usuarioId!: string;

  @IsEnum(RolResponsablePqrs)
  rolResponsable!: RolResponsablePqrs;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
