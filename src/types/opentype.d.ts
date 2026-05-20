declare module '@shuding/opentype.js' {
  export type Font = {
    getAdvanceWidth(text: string, fontSize: number): number;
  };

  export function parse(buffer: ArrayBuffer): Font;
}
