/**
 * Extract width and height from SVG content
 */
export const extractSvgDimensions = (svgContent: string): { width: number, height: number } => {
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');
      
      if (!svgElement) {
        return { width: 100, height: 100 }; // Default
      }
      
      // Try to get width and height attributes
      let width: number = parseInt(svgElement.getAttribute('width') || '0', 10);
      let height: number = parseInt(svgElement.getAttribute('height') || '0', 10);
      
      // If no width/height, try to parse viewBox
      if (!width || !height) {
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
          const [, , viewBoxWidth, viewBoxHeight] = viewBox.split(' ').map(Number);
          width = viewBoxWidth || 100;
          height = viewBoxHeight || 100;
        }
      }
      
      // Ensure we have valid dimensions
      return { 
        width: width || 100, 
        height: height || 100 
      };
    } catch (err) {
      console.error('Error extracting SVG dimensions:', err);
      return { width: 100, height: 100 }; // Default fallback
    }
  };
  
  /**
   * Validate if a string contains a valid SVG
   */
  export const isValidSvg = (content: string): boolean => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'image/svg+xml');
      
      // Check if there was a parsing error
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return false;
      }
      
      // Check if it contains an SVG element
      const svgElement = doc.querySelector('svg');
      return !!svgElement;
    } catch (err) {
      return false;
    }
  };