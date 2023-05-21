import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post, Query,
  UseInterceptors,
} from '@nestjs/common'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { VehicleService } from '../service/vehicle.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { FMSClient } from '../../clients/fms.client'
import { FMS } from '@slp/shared'
import { VehicleDto } from '../dto/vehicle.dto'
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ASYNC_STORAGE } from '../../modules/async-storage/async-storage.const'
import { AsyncLocalStorage } from 'async_hooks'
import { AsyncStorageType } from '../../modules/async-storage/async-storage.type'

@ApiTags('Vehicle')
@Controller({ path: 'companies/:companyId/vehicles', version: '1' })
export class VehicleController {
  constructor(
    private readonly fmsClient: FMSClient,
    private readonly vehicleService: VehicleService,
    @Inject(ASYNC_STORAGE) private readonly als: AsyncLocalStorage<AsyncStorageType>,
  ) {}

  @ApiOperation({ summary: 'Get Vehicles' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get()
  @UseInterceptors(ListResponseInterceptor)
  async vehicles(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.vehicleService.vehicles(companyId, page, perPage)
  }

  @ApiOperation({ summary: 'Vehicle create' })
  @ApiBody({ type: VehicleDto.VehicleCreate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post()
  async create(@Param('companyId', ParseUUIDPipe) companyId: string, @Body() data: FMS.Vehicle.CreateRequest) {
    return getDataOrThrow(
      this.fmsClient.vehicleCreate({ companyId, ...data }, { traceId: this.als.getStore()?.get('traceId') }),
    )
  }

  @ApiOperation({ summary: 'Vehicle update' })
  @ApiBody({ type: VehicleDto.VehicleUpdate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() data,
  ) {
    return getDataOrThrow(
      this.fmsClient.vehicleUpdate({ ...data, id, companyId }, { traceId: this.als.getStore()?.get('traceId') }),
    )
  }

  @ApiOperation({ summary: 'Get Producers' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get('producer')
  @UseInterceptors(ListResponseInterceptor)
  async findAllProducers() {
    return this.vehicleService.listProducer()
  }

  @ApiOperation({ summary: 'Producer Create' })
  @ApiBody({ type: VehicleDto.ProducerCreate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('producer')
  async createProducer(@Body() data) {
    return getDataOrThrow(this.fmsClient.producerCreate({ ...data }, { traceId: this.als.getStore()?.get('traceId') }))
  }

  @ApiOperation({ summary: 'Producer Update' })
  @ApiBody({ type: VehicleDto.ProducerUpdate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('producer/:id')
  async updateProducer(@Param('id', ParseIntPipe) id: number, @Body() data) {
    return getDataOrThrow(this.fmsClient.producerUpdate({ ...data, id }))
  }

  @ApiOperation({ summary: 'Get Vehicle Mileages' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get('mileages')
  @UseInterceptors(ListResponseInterceptor)
  async fetchAllVehicleMileage() {
    return this.vehicleService.findAllAllVehicleMileage()
  }

  @ApiOperation({ summary: 'Mileage Create' })
  @ApiBody({ type: VehicleDto.MileageCreate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:id/mileage')
  async createMileage(@Param('id', ParseUUIDPipe) id: string, @Body() data) {
    return getDataOrThrow(
      this.fmsClient.mileageCreate({ ...data, id }, { traceId: this.als.getStore()?.get('traceId') }),
    )
  }

  @ApiOperation({ summary: 'Mileage Update' })
  @ApiBody({ type: VehicleDto.MileageUpdate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:id/mileage')
  async updateMileage(@Param('id', ParseUUIDPipe) id: string, @Body() data) {
    return getDataOrThrow(
      this.fmsClient.mileageUpdate({ ...data, id }, { traceId: this.als.getStore()?.get('traceId') }),
    )
  }

  @ApiOperation({ summary: 'Get Models' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get('model')
  @UseInterceptors(ListResponseInterceptor)
  async findAllModel() {
    return this.vehicleService.listModel()
  }

  @ApiOperation({ summary: 'Model Create' })
  @ApiBody({ type: VehicleDto.ModelCreate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('model')
  async createModel(@Body() data) {
    return getDataOrThrow(this.fmsClient.modelCreate({ ...data }, { traceId: this.als.getStore()?.get('traceId') }))
  }

  @ApiOperation({ summary: 'Model Update' })
  @ApiBody({ type: VehicleDto.ModelUpdate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('model/:id')
  async updateModel(@Param('id', ParseIntPipe) id: number, @Body() data) {
    return getDataOrThrow(this.fmsClient.modelUpdate({ ...data, id }, { traceId: this.als.getStore()?.get('traceId') }))
  }

  @ApiOperation({ summary: 'Get Types' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get('type')
  @UseInterceptors(ListResponseInterceptor)
  async findAllTypes() {
    return this.vehicleService.listType()
  }

  @ApiOperation({ summary: 'Type Create' })
  @ApiBody({ type: VehicleDto.TypeCreate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('type')
  async createType(@Body() data) {
    return getDataOrThrow(this.fmsClient.typeCreate({ ...data }, { traceId: this.als.getStore()?.get('traceId') }))
  }

  @ApiOperation({ summary: 'Type Update' })
  @ApiBody({ type: VehicleDto.TypeUpdate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('type/:id')
  async updateType(@Param('id', ParseIntPipe) id: number, @Body() data) {
    return getDataOrThrow(this.fmsClient.typeUpdate({ ...data, id }, { traceId: this.als.getStore()?.get('traceId') }))
  }

  @ApiOperation({ summary: 'Get Body Types' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get('body-type')
  @UseInterceptors(ListResponseInterceptor)
  async findAllBodyTypes() {
    return this.vehicleService.listBodyType()
  }

  @ApiOperation({ summary: 'Body Type Create' })
  @ApiBody({ type: VehicleDto.BodyTypeCreate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('body-type')
  async createBodyType(@Body() data) {
    return getDataOrThrow(this.fmsClient.bodyTypeCreate({ ...data }, { traceId: this.als.getStore()?.get('traceId') }))
  }

  @ApiOperation({ summary: 'Body Type Update' })
  @ApiBody({ type: VehicleDto.BodyTypeUpdate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('body-type/:id')
  async updateBodyType(@Param('id', ParseIntPipe) id: number, @Body() data) {
    return getDataOrThrow(
      this.fmsClient.bodyTypeUpdate({ ...data, id }, { traceId: this.als.getStore()?.get('traceId') }),
    )
  }

  @ApiOperation({ summary: 'Get Colours' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get('colour')
  @UseInterceptors(ListResponseInterceptor)
  async findAllColours() {
    return this.vehicleService.listColour()
  }

  @ApiOperation({ summary: 'Colour create' })
  @ApiBody({ type: VehicleDto.ColourCreate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('colour')
  async createColour(@Body() data) {
    return getDataOrThrow(this.fmsClient.colourCreate({ ...data }, { traceId: this.als.getStore()?.get('traceId') }))
  }

  @ApiOperation({ summary: 'Colour Update' })
  @ApiBody({ type: VehicleDto.ColourUpdate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('colour/:id')
  async updateColour(@Param('id', ParseIntPipe) id: number, @Body() data) {
    return getDataOrThrow(
      this.fmsClient.colourUpdate({ ...data, id }, { traceId: this.als.getStore()?.get('traceId') }),
    )
  }

  @ApiOperation({ summary: 'Get Luggage Dimensions' })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Get('luggage')
  @UseInterceptors(ListResponseInterceptor)
  async findAllLuggage() {
    return this.vehicleService.findAllLuggage()
  }

  @ApiOperation({ summary: 'Luggage create' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.OK)
  @Post('luggage')
  async createLuggage(@Body() data: VehicleDto.LuggageCreate): Promise<number> {
    return getDataOrThrow(this.fmsClient.luggageCreate(data, { traceId: this.als.getStore()?.get('traceId') }))
  }

  @ApiOperation({ summary: 'Luggage Update' })
  @ApiBody({ type: VehicleDto.ColourUpdate })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('luggage/:id')
  async updateLuggage(@Param('id', ParseIntPipe) id: number, @Body() data: Omit<VehicleDto.LuggageCreate, 'id'>) {
    return getDataOrThrow(
      this.fmsClient.luggageUpdate({ ...data, id }, { traceId: this.als.getStore()?.get('traceId') }),
    )
  }
}
