# SVG Layout Editor

A React application for visual SVG editing and layout composition, built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Upload SVGs via file drag & drop or URL input
- Preview uploaded SVGs in the sidebar
- Drag SVGs from the sidebar into the canvas
- Position and resize SVGs on the canvas
- Export the final layout as JSON

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- react-draggable for SVG manipulation
- UUID for generating unique IDs

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

## Usage

1. Upload SVGs using the upload area or URL input
2. Drag SVGs from the right sidebar onto the canvas
3. Resize SVGs by dragging the corner handles
4. Position SVGs by dragging them around the canvas
5. Click "Export Layout" to copy the layout data to your clipboard

## Project Structure

- `src/components/` - React components
  - `SvgCanvas.tsx` - Main editing canvas
  - `Sidebar.tsx` - Right sidebar container
  - `Uploader.tsx` - SVG upload component
  - `SvgPreviewList.tsx` - Uploaded SVG previews
  - `ExportButton.tsx` - Export functionality
- `src/types.ts` - TypeScript interfaces
- `src/utils/` - Utility functions