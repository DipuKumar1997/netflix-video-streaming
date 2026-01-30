// For importing images like .png, .jpg
declare module '*.png' {
  const value: string;
  export default value;
}
declare module '*.jpg' {
  const value: string;
  export default value;
}

// For importing .svg as string (e.g. for <img src=...>)
declare module '*.svg' {
  const content: string;
  export default content;
}

// If you want to import SVGs as React components:
declare module '*.svg?react' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}
