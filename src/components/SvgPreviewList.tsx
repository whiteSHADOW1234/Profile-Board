// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\components\SvgPreviewList.tsx
import { useState } from 'react';
import { UploadedAsset } from '../types'; // Updated import

interface SvgPreviewListProps {
  assets: UploadedAsset[]; // Renamed prop
  onAddToCanvas: (asset: UploadedAsset) => void; // Updated type
}

const SvgPreviewList = ({ assets, onAddToCanvas }: SvgPreviewListProps) => { // Renamed prop
  const [draggingAssetId, setDraggingAssetId] = useState<string | null>(null); // Renamed state

  const handleDragStart = (e: React.DragEvent, asset: UploadedAsset) => { // Updated type
    // Transfer necessary data (ID is primary key)
    const transferData = {
      id: asset.id,
      // url: asset.url // URL not strictly needed if we look up by ID on drop
    };
    e.dataTransfer.setData('application/json', JSON.stringify(transferData));
    setDraggingAssetId(asset.id); // Use renamed state setter

    // Set drag image (optional - using the asset URL works fine)
    const dragImg = new Image();
    // Use a small fixed size or try to load the actual image
    dragImg.src = asset.url;
    // Set offset for the drag image
    try {
        // Offset slightly so cursor isn't directly over the image center
        e.dataTransfer.setDragImage(dragImg, 25, 25);
    } catch (error) {
        console.warn("Could not set drag image (maybe CORS issue with URL?):", error);
        // Fallback: browser default drag image will be used
    }
  };

  const handleDragEnd = () => {
    setDraggingAssetId(null); // Use renamed state setter
  };

  const handleDoubleClick = (asset: UploadedAsset) => { // Updated type
    onAddToCanvas(asset);
  };

  if (assets.length === 0) { // Use renamed prop
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        No assets uploaded yet. {/* Updated text */}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {assets.map((asset) => ( // Use renamed prop and variable
        <div
          key={asset.id}
          className={`
            p-2 border rounded bg-white cursor-grab
            ${draggingAssetId === asset.id ? 'opacity-50' : ''} {/* Use renamed state */}
          `}
          draggable
          onDragStart={(e) => handleDragStart(e, asset)}
          onDragEnd={handleDragEnd}
          onDoubleClick={() => handleDoubleClick(asset)}
          title="Drag to canvas or double-click to add"
        >
          <div className="h-16 flex items-center justify-center p-1">
            {/* img tag works for rendering both SVG and raster images via URL */}
            <img
              src={asset.url}
              alt={`${asset.type} Preview`} // Dynamic alt text
              className="max-h-full max-w-full object-contain"
              // Add error handling for broken image links
              onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if broken
            />
             {/* Optional: Show placeholder if image fails */}
             <div
                className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400"
                style={{ display: 'none' }} // Initially hidden, shown by onError logic if needed
                ref={(el) => {
                    if (el) {
                        const img = el.previousElementSibling as HTMLImageElement;
                        if (img) {
                            img.onerror = () => {
                                img.style.display = 'none';
                                el.style.display = 'flex';
                            };
                        }
                    }
                }}
            >
                Load Error
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SvgPreviewList;
