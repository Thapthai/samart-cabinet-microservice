import { IsString, IsInt, IsOptional, IsBoolean, MinLength, MaxLength, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

const toBool = (v: unknown): boolean | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === '1' || v === 1) return true;
  if (v === 'false' || v === '0' || v === 0) return false;
  return undefined;
};

export class CreateCabinetTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name_th?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name_en?: string;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  has_expiry?: boolean;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  show_rfid_code?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCabinetTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name_th?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name_en?: string;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  has_expiry?: boolean;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  show_rfid_code?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  is_active?: boolean;
}
