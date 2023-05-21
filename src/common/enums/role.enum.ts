export enum ROLE {
  // Company
  COMPANY_CREATE = 'realm:company-create',
  COMPANY_READ = 'realm:company-read',
  COMPANY_UPDATE = 'realm:company-update',
  COMPANY_MANAGEMENT = 'realm:company-management',
  // Order
  ORDER_CREATE = 'realm:order-create',
  ORDER_MANAGEMENT = 'realm:order-management',
  // Group
  GROUP_READ = 'realm:group-read',
  GROUP_CREATE = 'realm:group-create',
  GROUP_UPDATE = 'realm:group-update',
  GROUP_DELETE = 'realm:group-delete',
  GROUP_MANAGEMENT = 'realm:group-management',
  // Role
  ROLE_READ = 'realm:role-read',
  // User
  USER_CREATE = 'realm:user-create',
  USER_READ = 'realm:user-read',
  USER_UPDATE = 'realm:user-update',
  USER_MANAGEMENT = 'realm:user-management',
  DC_MANAGER = 'realm:dc-manager',
  PP_MANAGER = 'realm:pp-manager',
}
