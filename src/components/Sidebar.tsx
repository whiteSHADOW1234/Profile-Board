// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\components\Sidebar.tsx
import { UploadedAsset } from '../types'; // Updated import
import Uploader from './Uploader';
import SvgPreviewList from './SvgPreviewList';
import ExportButton from './ExportButton';
// Removed DemoSvg import/usage as it wasn't in the request scope, add back if needed

interface SidebarProps {
  uploadedAssets: UploadedAsset[]; // Renamed prop
  onAssetUpload: (asset: UploadedAsset) => void; // Renamed prop
  onAddToCanvas: (asset: UploadedAsset) => void; // Updated type
  onExport: () => void;
}

const Sidebar = ({
  uploadedAssets, // Use renamed prop
  onAssetUpload,  // Use renamed prop
  onAddToCanvas,
  onExport
}: SidebarProps) => {
  return (
    <div className="w-full md:w-64 bg-gray-200 p-4 flex flex-col h-screen">


      <div className="flex-1 mt-6 overflow-y-auto">
        <SvgPreviewList
          assets={uploadedAssets} // Pass renamed prop
          onAddToCanvas={onAddToCanvas}
        />
      </div>

      {/* Pass renamed prop */}
      <Uploader onAssetUpload={onAssetUpload} />
      <ExportButton onExport={onExport} />
      {/* Add DemoSvg back here if needed, ensuring it creates an UploadedAsset */}
      {/* <DemoSvg onAddDemo={onAssetUpload} /> */}
    </div>
  );
};

export default Sidebar;
