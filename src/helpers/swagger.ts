export const CompanyCreateExample = {
  schema: {
    example: {
      name: 'company',
      address: 'address',
      phone: '998909324411',
      email: 'mail@mail.com',
      deliveryPeriod: 12,
      density: 12,
      pointServeTime: 2,
      tariffCalculateType: 'BY_WEIGHT',
      companyPoolScheduleType: 'ASAP',
      maxPointPerRoute: 12,
      maxTimePerRoute: 150,
      maxOrdersPerRoute: 10,
      sortType: 'SIMPLE',
    },
  },
}

export const CompanyUpdateExample = {
  schema: {
    example: {
      id: 'UUID',
      name: 'New name',
      address: 'address',
      phone: '998912234455',
      email: 'some_new_email@mail.com',
    },
  },
}

export const CompanyClientExample = {
  schema: {
    example: {
      companyId: 'UUID',
      groupId: 'UUID',
      username: 'username',
      email: 'email',
      firstName: 'firstname',
      lastName: 'lastname',
      phone: '998912223344',
      password: 'password',
      role: 'role is optional',
      webhookUrl: 'webhook',
    },
  },
}

export const CompanyGroupCreateExample = {
  schema: {
    example: {
      name: 'Example',
    },
  },
}
