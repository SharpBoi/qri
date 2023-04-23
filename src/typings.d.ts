declare module '*.svg' {
  import React from 'react'
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>
  export default SVG
}
declare module '*.svg?url' {
  export default string
}

declare module '*.scss' {
  const value: { [k: string]: string }
  export = value
}

declare interface Console {
  re: Console
}
