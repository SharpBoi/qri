declare module '*.scss' {
  const value: { [k: string]: string }
  export = value
}

declare interface Console {
  re: Console
}
