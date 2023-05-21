import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeycloakConnectModuleAsyncOptions, PolicyEnforcementMode, TokenValidation } from 'nest-keycloak-connect';

interface KeycloakConfig {
  authServerUrl: string;
  realm: string;
  clientId: string;
  secret: string;
}

export const getKeycloakConfig = (): KeycloakConnectModuleAsyncOptions => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const config = configService.get<KeycloakConfig>('keycloak');

    return {
      authServerUrl: config.authServerUrl,
      realm: config.realm,
      clientId: config.clientId,
      secret: config.secret,
      tokenValidation: TokenValidation.OFFLINE,
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
    };
  },
});