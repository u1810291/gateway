import { PrismaService } from '../prisma/prisma.service'
import { snakeToCamelCase } from './convert.helper'

type columnType = 'string' | 'boolean' | 'number' | 'enum' | 'datetime' | 'date'

interface DataType {
  name: string
  title: string
  type: columnType
  sort: boolean
  facet: boolean
  search: boolean
  values: string[] | null
}

export const getDataTypes = async (
  prisma: PrismaService,
  tableName: string,
  excludes: string[] = [],
  prefix: string = '',
  schema = 'public',
): Promise<DataType[]> => {
  let columns = await prisma.$queryRawUnsafe<
    {
      column_name: string
      data_type: 'uuid' | 'USER-DEFINED'
      udt_name: string
    }[]
  >(
    "select column_name, data_type, udt_name from information_schema.columns where table_schema = '" +
      schema +
      "' and table_name = '" +
      tableName +
      "'",
  )

  const enums: string[] = columns.filter((item) => item.data_type === 'USER-DEFINED').map((item) => item.udt_name)
  let enumValues = {}

  if (enums.length > 0) {
    enumValues = await prisma
      .$queryRawUnsafe<{ typname: string; enumlabel: string }[]>(
        "SELECT t.typname,e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname in ('" +
          enums.join("','") +
          "')",
      )
      .then((items) =>
        items.reduce((acc: Record<string, string[]>, item) => {
          if (acc.hasOwnProperty(item.typname)) {
            acc[item.typname].push(item.enumlabel)
          } else {
            acc[item.typname] = [item.enumlabel]
          }

          return acc
        }, {}),
      )
  }

  if (excludes.length !== 0) {
    columns = columns.filter((column) => !excludes.includes(column.column_name))
  }

  return columns.map((column) => ({
    name: prefix ? prefix + '.' + snakeToCamelCase(column.column_name) : snakeToCamelCase(column.column_name),
    title: prefix ? prefix + '.' + snakeToCamelCase(column.column_name) : snakeToCamelCase(column.column_name),
    type: getColumnType(column.data_type),
    sort: true,
    facet: column.data_type === 'USER-DEFINED',
    search: false,
    values: enumValues.hasOwnProperty(column.udt_name) ? enumValues[column.udt_name] : null,
  }))
}

const getColumnType = (columnType: string): columnType => {
  switch (columnType) {
    case 'USER-DEFINED':
      return 'enum'
    case 'integer':
      return 'number'
    case 'uuid':
    case 'character varying':
      return 'string'
    case 'timestamp':
    case 'timestamp with time zone':
      return 'datetime'
    default:
      return columnType as any
  }
}

export type RelationData = {
  prisma: PrismaService
  tableName: string
  excludes: string[]
  relation: RelationData[]
}

export const getMultiplyDataTypes = async (data: RelationData, prefix: string = '', nestingLevel: number = 0) => {
  const columns = []

  if (nestingLevel === 0) {
    columns.push(...(await getDataTypes(data.prisma, data.tableName, data.excludes, prefix)))
  }

  if (data.relation.length) {
    for (const relation of data.relation) {
      if (nestingLevel !== 0) {
        columns.push(
          ...(await getDataTypes(relation.prisma, relation.tableName, relation.excludes, relation.tableName)),
        )
      }
      if (relation.relation.length) {
        prefix += `${prefix.length === 0 ? '' : '.'}${relation.tableName}`
        columns.push(...(await getMultiplyDataTypes(relation, prefix, nestingLevel++)))
      } else {
        prefix += `${prefix.length === 0 ? '' : '.'}${relation.tableName}`
        columns.push(...(await getDataTypes(relation.prisma, relation.tableName, relation.excludes, prefix)))
        prefix = ''
      }
    }
  }

  return columns.filter((value, index) => {
    const _value = JSON.stringify(value)
    return (
      index ===
      columns.findIndex((obj) => {
        return JSON.stringify(obj) === _value
      })
    )
  })
}
