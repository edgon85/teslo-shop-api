import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  /*   @IsNumber()*/
  @Type(() => Number)
  limit?: number;

  @IsOptional()
/*   @IsPositive() */
  @Min(0)
  @Type(() => Number) // equivale a enableImplicitConversion: true, en main.ts
  offset?: number;
}
