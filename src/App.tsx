// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\App.tsx
import { useState, useEffect } from 'react'; // Import useEffect
import { CanvasItem, UploadedAsset } from './types';
import SvgCanvas from './components/SvgCanvas';
import Sidebar from './components/Sidebar';
import './index.css';

function App() {
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);

  // --- Existing Handlers ---
  const handleAssetUpload = (asset: UploadedAsset) => {
    setUploadedAssets(prev => [...prev, asset]);
  };

  const handleAddToCanvas = (asset: UploadedAsset) => {
    const originalAsset = uploadedAssets.find(item => item.id === asset.id) || asset;
    const newItem: CanvasItem = {
      id: crypto.randomUUID(),
      url: originalAsset.url,
      type: originalAsset.type,
      content: originalAsset.content,
      x: 50, y: 50, width: 100, height: 100
    };
    setCanvasItems(prev => [...prev, newItem]);
  };

  const handleDropOnCanvas = (originalAssetId: string, x: number, y: number) => {
    const originalAsset = uploadedAssets.find(asset => asset.id === originalAssetId);
    if (!originalAsset) {
      console.error("Dropped Asset not found in uploaded list:", originalAssetId);
      alert("Error: Could not find the original asset data for the dropped item.");
      return;
    }
    const newItem: CanvasItem = {
      id: crypto.randomUUID(),
      url: originalAsset.url,
      type: originalAsset.type,
      content: originalAsset.content,
      x: x, y: y, width: 100, height: 100
    };
    setCanvasItems(prev => [...prev, newItem]);
  };

  const handleUpdateCanvasItem = (updatedItem: CanvasItem) => {
    setCanvasItems(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleDeleteCanvasItem = (itemIdToDelete: string) => {
    setCanvasItems(prev => prev.filter(item => item.id !== itemIdToDelete));
  };

  // *** NEW: Handler for deleting an uploaded asset from the sidebar ***
  const handleDeleteUploadedAsset = (assetIdToDelete: string) => {
    // Find the asset to potentially revoke its URL
    const assetToDelete = uploadedAssets.find(asset => asset.id === assetIdToDelete);

    // Remove from state
    setUploadedAssets(prev => prev.filter(asset => asset.id !== assetIdToDelete));

    // Also remove any instances of this asset from the canvas
    setCanvasItems(prev => prev.filter(item => {
        // This assumes canvas items store the original URL. If they could be modified,
        // you might need a more robust way to link canvas items back to original assets,
        // perhaps by storing originalAssetId on the CanvasItem.
        // For now, let's assume URL matching is sufficient for blob URLs.
        if (assetToDelete && item.url === assetToDelete.url) {
            return false; // Remove items using the same URL as the deleted asset
        }
        return true;
    }));

    // Optional: Clean up Blob URL to free memory if it was created from a file
    if (assetToDelete && assetToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(assetToDelete.url);
      console.log("Revoked Blob URL:", assetToDelete.url);
    }
  };

  const handleExport = () => {
    const exportData = canvasItems.map(({ id, url, type, x, y, width, height }) => ({
      id, url, type, x, y, width, height
    }));
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      .then(() => alert('Layout copied to clipboard!'))
      .catch(err => {
        console.error('Failed to copy layout to clipboard:', err);
        alert('Error copying to clipboard. See console for details.');
      });
  };

  // Optional: Cleanup Blob URLs on component unmount
  useEffect(() => {
    return () => {
      uploadedAssets.forEach(asset => {
        if (asset.url.startsWith('blob:')) {
          URL.revokeObjectURL(asset.url);
          console.log("Revoking Blob URL on unmount:", asset.url);
        }
      });
    };
  }, [uploadedAssets]); // Re-run if uploadedAssets changes (though cleanup is mainly for unmount)


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
        <SvgCanvas
          items={canvasItems}
          onUpdateItem={handleUpdateCanvasItem}
          onDropItem={handleDropOnCanvas}
          onDeleteItem={handleDeleteCanvasItem}
        />
      </div>
      <Sidebar
        uploadedAssets={uploadedAssets}
        onAssetUpload={handleAssetUpload}
        onAddToCanvas={handleAddToCanvas}
        onExport={handleExport}
        onDeleteAsset={handleDeleteUploadedAsset} // <-- Pass the new handler
      />
    </div>
  );
}

export default App;
