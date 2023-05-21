export const closingColumns = (object, key: string[]): any => {
  const obj: any = {}
  for (const i in object) {
    if (!key.includes(i)) {
      Object.assign(obj, { [i]: object[i] })
    }
  }
  return obj
}
