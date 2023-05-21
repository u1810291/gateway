import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { DriverService } from '../service/driver.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { FMSClient } from '../../clients/fms.client'
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { DriverDto } from '../dto/driver.dto'
import { UMSClient } from '../../clients/ums.client'
import { UMS } from '@slp/shared'

@ApiTags('Driver')
@Controller({ path: 'companies/:companyId/drivers', version: '1' })
export class DriverController {
  constructor(
    private readonly fmsClient: FMSClient,
    private readonly driverService: DriverService,
    private readonly userClient: UMSClient,
  ) {}

  @ApiOperation({ summary: 'Get Drivers' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get()
  @UseInterceptors(ListResponseInterceptor)
  async drivers(@Query() query: DriverDto.DriverFilterDto) {
    return this.driverService.drivers(query)
  }

  @ApiOperation({ summary: 'Get One Driver' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  @UseInterceptors(ListResponseInterceptor)
  async driver(@Param('id') id: string) {
    return this.driverService.driver(id)
  }

  @ApiOperation({ summary: 'Driver Create' })
  @ApiBody({ type: DriverDto.DriverCreate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post()
  async create(@Param('companyId', ParseUUIDPipe) companyId: string, @Body() data: UMS.Driver.CreateRequest) {
    await this.driverService.checkDc(data.dcId)
    return getDataOrThrow(this.userClient.driverCreate({ ...data, companyId }))
  }

  @ApiOperation({ summary: 'Driver Update' })
  @ApiBody({ type: DriverDto.DriverUpdate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UMS.Driver.UpdateRequest) {
    return getDataOrThrow(this.userClient.driverUpdate({ id, ...data }))
  }

  @ApiOperation({ summary: 'Active drivers' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ListResponseInterceptor)
  @Get('available-drivers')
  async availableDrivers() {
    return this.driverService.availableDrivers()
  }
}
