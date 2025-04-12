// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\components\SvgPreviewList.tsx
import { useState } from 'react';
import { UploadedAsset } from '../types';

// Simple inline SVG for a small 'X' icon
const SmallDeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
        <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L8 6.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L9.06 8l4.72 4.72a.75.75 0 1 1-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
);


interface SvgPreviewListProps {
  assets: UploadedAsset[];
  onAddToCanvas: (asset: UploadedAsset) => void;
  onDeleteAsset: (assetId: string) => void; // <-- Add prop type
}

const SvgPreviewList = ({ assets, onAddToCanvas, onDeleteAsset }: SvgPreviewListProps) => { // <-- Destructure onDeleteAsset
  const [draggingAssetId, setDraggingAssetId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, asset: UploadedAsset) => {
    // --- Drag start logic remains the same ---
    const transferData = { id: asset.id };
    e.dataTransfer.setData('application/json', JSON.stringify(transferData));
    setDraggingAssetId(asset.id);
    const dragImg = new Image();
    dragImg.src = asset.url;
    try {
        e.dataTransfer.setDragImage(dragImg, 25, 25);
    } catch (error) {
        console.warn("Could not set drag image:", error);
    }
  };

  const handleDragEnd = () => {
    setDraggingAssetId(null);
  };

  const handleDoubleClick = (asset: UploadedAsset) => {
    onAddToCanvas(asset);
  };

  // *** NEW: Handler for the delete button click ***
  const handleDeleteClick = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation(); // IMPORTANT: Prevent triggering double-click or drag start
    // Optional: Confirm before deleting
    if (window.confirm("Are you sure you want to delete this asset? This will also remove it from the canvas.")) {
        onDeleteAsset(assetId);
    }
  };

  if (assets.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        No assets uploaded yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {assets.map((asset) => (
        // Add relative positioning context for the absolute button
        <div
          key={asset.id}
          className={`
            relative group p-2 border rounded bg-white cursor-grab
            ${draggingAssetId === asset.id ? 'opacity-50' : ''}
          `}
          draggable
          onDragStart={(e) => handleDragStart(e, asset)}
          onDragEnd={handleDragEnd}
          onDoubleClick={() => handleDoubleClick(asset)}
          title="Drag to canvas or double-click to add"
        >
          {/* Image Preview Area */}
          <div className="h-16 flex items-center justify-center p-1">
            <img
              src={asset.url}
              alt={`${asset.type} Preview`}
              className="max-h-full max-w-full object-contain"
              // Keep error handling
              onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  // Find the sibling placeholder and display it
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
              }}
            />
             {/* Placeholder on error */}
             <div
                className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400"
                style={{ display: 'none' }} // Initially hidden
            >
                Load Error
            </div>
          </div>

          {/* *** NEW: Delete Button *** */}
          <button
            onClick={(e) => handleDeleteClick(e, asset.id)}
            className={`
              absolute top-0 right-0 mt-1 mr-1 p-0.5
              bg-red-500 hover:bg-red-700 text-white
              rounded-full opacity-0 group-hover:opacity-100 transition-opacity
              focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75
            `}
            title="Delete Asset"
            // Prevent drag start when clicking the button
            onMouseDown={(e) => e.stopPropagation()}
          >
            <SmallDeleteIcon />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SvgPreviewList;
