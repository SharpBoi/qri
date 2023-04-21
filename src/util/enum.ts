// just for fun

export function makeEnum<T extends readonly any[]>(flags: T) {
  type Enum<T extends readonly any[]> = {
    [k in T[number]]: string
  }

  return flags.reduce((acc, flag) => ({ ...acc, [flag]: flag }), {}) as Enum<T>
}
