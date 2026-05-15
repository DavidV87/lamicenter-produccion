import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearChecklistDespachoItemDto {
  @IsUUID()
  tipoValidacionDespachoId!: string;

  @IsBoolean()
  cumple!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;
}

export class CrearChecklistDespachoDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearChecklistDespachoItemDto)
  items!: CrearChecklistDespachoItemDto[];
}
