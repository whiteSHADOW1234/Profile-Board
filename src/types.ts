export interface SvgItem {
    id: string;
    url: string;
    content?: string; // For inline SVG content
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  export interface UploadedSvg {
    id: string;
    url: string;
    content?: string; // Raw SVG content
  }
  