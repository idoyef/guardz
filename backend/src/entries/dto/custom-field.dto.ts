import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CustomFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  key: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  value: string;
}
