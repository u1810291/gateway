import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common'
import { CompanyRoutePlannerService } from '../services/company-route-planner.service'
import { TMSClient } from '../../clients/tms.client'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { TMS } from '@slp/shared'
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { RoutePlannerDto } from '../dto/route-planner.dto'
import { Timezone } from '../../decorators/timezone-param.decorator'
import { Unprotected } from 'nest-keycloak-connect'
import { transformMilitaryTimeToUTCMilitaryTime } from '../../helpers/date.helper'

@Controller({ version: '1', path: '/companies/:companyId/route-planners' })
export class CompanyRoutePlannerController {
  constructor(
    private readonly tmsClient: TMSClient,
    private readonly routePlannerService: CompanyRoutePlannerService,
  ) {}

  @ApiOperation({ summary: 'Create Route Planner' })
  @ApiOkResponse({ description: 'Created Successfully' })
  @ApiBody({ type: RoutePlannerDto.CreteDto })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post()
  async create(
    @Body() data: Omit<TMS.RoutePlanner.CreateRequest, 'companyId'>,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Timezone() tz: string,
  ) {
    data.startTime = transformMilitaryTimeToUTCMilitaryTime(data.startTime, tz)

    return getDataOrThrow(this.tmsClient.routePlannerCreate({ ...data, companyId }))
  }

  @ApiOperation({ summary: 'Update Route Planner' })
  @ApiOkResponse({ description: 'Updated Successfully' })
  @ApiBody({ type: RoutePlannerDto.UpdateDto })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id')
  async update(
    @Body() data: Omit<TMS.RoutePlanner.UpdateRequest, 'id'>,
    @Param('id', ParseUUIDPipe) id: string,
    @Timezone() tz: string,
  ) {
    data.startTime = transformMilitaryTimeToUTCMilitaryTime(data.startTime, tz)

    return getDataOrThrow(this.tmsClient.routePlannerUpdate({ ...data, id }))
  }

  @ApiOperation({ summary: 'Delete RoutePlanner' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePlanner(@Param('id', ParseUUIDPipe) id: string) {
    return this.tmsClient.routePlannerDelete({ id })
  }

  @Unprotected()
  @ApiOperation({ summary: 'Get RoutePlanners' })
  @ApiOkResponse({ description: 'Ok' })
  @Get()
  async getRoutePlanners(
      @Param('companyId', ParseUUIDPipe) companyId: string, @Timezone() tz: string,
      @Query('page') page: number, @Query('perPage') perPage: number,
  ) {
    return this.routePlannerService.routePlannerList(companyId, tz, page, perPage)
  }

  @ApiOperation({ summary: 'RoutePlanner by Id' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'RoutePlanner does not found' })
  @Get(':id')
  async getRoutePlanner(@Param('id', ParseUUIDPipe) id: string, @Timezone() tz: string) {
    return this.routePlannerService.routePlannerFindOne(id, tz)
  }
}
