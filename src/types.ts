  export interface UploadedAsset { // Renamed from UploadedSvg
    id: string;
    url: string;         // URL (file blob, data URI, or external link)
    type: 'svg' | 'image'; // Distinguish asset type
    content?: string;      // Optional: Raw SVG content (only for type: 'svg')
  }
  
  export interface CanvasItem { // Renamed from SvgItem
    id: string;
    url: string;
    type: 'svg' | 'image';
    content?: string;      // Optional: Raw SVG content (only for type: 'svg')
    x: number;
    y: number;
    width: number;
    height: number;
  }