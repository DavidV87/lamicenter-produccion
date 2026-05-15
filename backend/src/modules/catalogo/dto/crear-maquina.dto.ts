import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CrearMaquinaDto {
  @IsUUID()
  sedeId!: string;

  @IsString()
  @MaxLength(150)
  nombre!: string;

  @IsString()
  @MaxLength(50)
  codigo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
