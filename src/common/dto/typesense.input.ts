import { IsInt, IsBoolean, IsString, IsOptional, IsNotEmpty, Min, Max, Matches, ValidateIf } from 'class-validator';
import { Param } from '../enums/param.enum';

export class TypesenseInput {
  @IsString()
  @IsNotEmpty()
  q: string = '*';

  @IsString()
  @ValidateIf((o) => o.q !== '*')
  query_by: string = '';

  @IsString()
  @IsOptional()
  query_by_weights?: string;

  @IsBoolean()
  @IsOptional()
  prefix?: boolean;

  @IsString()
  @IsOptional()
  filter_by?: string;

  @IsString()
  @IsOptional()
  @Matches(/(\w+(?=:(asc|desc))(?!,)?)/, { message: 'Invalid sort_by field' })
  sort_by?: string;

  @IsString()
  @IsOptional()
  facet_by?: string;

  @IsString()
  @IsOptional()
  facet_query?: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  page: number = 1;

  @IsInt()
  @Max(Param.MAX_PER_PAGE_SIZE)
  @IsNotEmpty()
  per_page: number = Param.DEFAULT_PER_PAGE_SIZE;

  @IsString()
  @IsOptional()
  pinned_hits?: string;

  @IsString()
  @IsOptional()
  hidden_hits?: string;

  @IsString()
  @IsOptional()
  include_fields?: string;

  @IsString()
  @IsOptional()
  exclude_fields?: string;
}
