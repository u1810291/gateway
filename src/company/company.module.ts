import { Module } from '@nestjs/common'
import { CompanyController } from './controllers/company.controller'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { TMSClient } from '../clients/tms.client'
import { CompanySettingController } from './controllers/company-setting.controller'
import { CompanyCourierController } from './controllers/company-courier.controller'
import { CompanyCourierRouteController } from './controllers/company-courier-route.controller'
import { CompanyCourierRouteOrderController } from './controllers/company-courier-route-order.controller'
import { CompanyPoolService } from './services/company-pool.service'
import { CompanyOrderService } from './services/company-order.service'
import { OMSClient } from '../clients/oms.client'
import { CompanyRouteService } from './services/company-route.service'
import { CompanyClientService } from './services/company-client.service'
import { CompanyStorageService } from './services/company-storage.service'
import { CompanyTariffService } from './services/company-tariff.service'
import { CompanyOrderController } from './controllers/company-order.controller'
import { CompanyZoneController } from './controllers/company-zone.controller'
import { CompanyPoolController } from './controllers/company-pool.controller'
import { CompanyRouteController } from './controllers/company-route.controller'
import { CompanyStorageController } from './controllers/company-storage.controller'
import { CompanyClientController } from './controllers/company-client.controller'
import { CompanyTariffController } from './controllers/company-tariff.controller'
import { CompanyService } from './services/company.service'
import { CompanyUserController } from './controllers/company-user.controller'
import { CompanyRoutePlannerController } from './controllers/company-route-planner.controller'
import { CompanyZoneService } from './services/company-zone.service'
import { CompanyUserService } from './services/company-user.service'
import { CompanyRoutePlannerService } from './services/company-route-planner.service'
import { RabbitmqModuleConfig } from '../config/rabbitmq-module.config'
import { CompanyCargoProviderService } from './services/company-cargo-provider.service'
import { CompanyCargoProviderController } from './controllers/company-cargo-provider.controller'
import { CompanyCourierService } from './services/company-courier.service'
import { CompanyDeliveryController } from './controllers/company-delivery.controller'
import { CompanyDcsController } from './controllers/company-dcs.controller'
import { CompanyDcService } from './services/company-dc.service'
import { WMSClient } from '../clients/wms.client'
import { GEOClient } from '../clients/geo.client'
import { UMSClient } from '../clients/ums.client'
import { CompanyDeliveryService } from './services/company-delivery.service'
import { GeoModule } from '../common/geo/geo.module'
import { CompanyImRouteController } from './controllers/company-im-route.controller'
import { CompanyImRouteService } from './services/company-im-route.service'
import { CompanyCourierRouteService } from './services/company-courier-route.service'
import { CompanyGroupController } from './controllers/company-group.controller'
import { CompanyWorkerController } from './controllers/company-worker.controller'
import { CompanyWorkerService } from './services/company-worker.service'
import { FMSClient } from '../clients/fms.client'
import { CompanySettingsService } from './services/company-settings.service'

@Module({
  controllers: [
    CompanyController,
    CompanySettingController,
    CompanyCourierController,
    CompanyCourierRouteController,
    CompanyCourierRouteOrderController,
    CompanyOrderController,
    CompanyZoneController,
    CompanyPoolController,
    CompanyRouteController,
    CompanyClientController,
    CompanyStorageController,
    CompanyTariffController,
    CompanyUserController,
    CompanyRoutePlannerController,
    CompanyCargoProviderController,
    CompanyDeliveryController,
    CompanyDcsController,
    CompanyZoneController,
    CompanyImRouteController,
    CompanyCourierController,
    CompanyCourierRouteController,
    CompanyCourierRouteOrderController,
    CompanyGroupController,
    CompanyWorkerController,
  ],
  providers: [
    FMSClient,
    UMSClient,
    GEOClient,
    WMSClient,
    TMSClient,
    CompanyService,
    CompanyPoolService,
    CompanyOrderService,
    OMSClient,
    CompanyRouteService,
    CompanyClientService,
    CompanyStorageService,
    CompanyTariffService,
    CompanyZoneService,
    CompanyUserService,
    CompanyRoutePlannerService,
    CompanyCargoProviderService,
    CompanyCourierService,
    CompanyDcService,
    CompanyDeliveryService,
    CompanyZoneService,
    CompanyDeliveryService,
    CompanyImRouteService,
    CompanyDeliveryService,
    CompanyCourierService,
    CompanyCourierRouteService,
    CompanyWorkerService,
    CompanySettingsService,
  ],
  imports: [RabbitMQModule.forRootAsync(RabbitMQModule, RabbitmqModuleConfig), GeoModule],
})
export class CompanyModule {}
