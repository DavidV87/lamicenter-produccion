import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  passwordActual!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña nueva es requerida' })
  @MinLength(8, { message: 'La contraseña nueva debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])/, {
    message: 'La contraseña debe contener mayúscula, minúscula, número y carácter especial',
  })
  passwordNuevo!: string;
}
