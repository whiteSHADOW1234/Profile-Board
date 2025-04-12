// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\components\Sidebar.tsx
import { UploadedAsset } from '../types';
import Uploader from './Uploader';
import SvgPreviewList from './SvgPreviewList';
import ExportButton from './ExportButton';
// import DemoSvg from './DemoSvg'; // Uncomment if using

interface SidebarProps {
  uploadedAssets: UploadedAsset[];
  onAssetUpload: (asset: UploadedAsset) => void;
  onAddToCanvas: (asset: UploadedAsset) => void;
  onExport: () => void;
  onDeleteAsset: (assetId: string) => void; // <-- Add prop type for delete handler
}

const Sidebar = ({
  uploadedAssets,
  onAssetUpload,
  onAddToCanvas,
  onExport,
  onDeleteAsset // <-- Destructure the new prop
}: SidebarProps) => {
  return (
    // Adjusted width from previous step
    <div className="w-full md:w-80 bg-gray-200 p-4 flex flex-col h-screen">

      {/* Uploader and Preview List */}
      <div className="flex-1 mt-6 overflow-y-auto">
        <SvgPreviewList
          assets={uploadedAssets}
          onAddToCanvas={onAddToCanvas}
          onDeleteAsset={onDeleteAsset} // <-- Pass handler down
        />
      </div>

      {/* Controls at the bottom */}
      <Uploader onAssetUpload={onAssetUpload} />
      <ExportButton onExport={onExport} />
      {/* <DemoSvg onAddDemo={onAssetUpload} /> */}
    </div>
  );
};

export default Sidebar;
