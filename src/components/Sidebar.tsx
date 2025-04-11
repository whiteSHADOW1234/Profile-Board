import { UploadedSvg } from '../types';
import Uploader from './Uploader';
import SvgPreviewList from './SvgPreviewList';
import ExportButton from './ExportButton';

interface SidebarProps {
  uploadedSvgs: UploadedSvg[];
  onSvgUpload: (svg: UploadedSvg) => void;
  onAddToCanvas: (svg: UploadedSvg) => void;
  onExport: () => void;
}

const Sidebar = ({ 
  uploadedSvgs, 
  onSvgUpload, 
  onAddToCanvas, 
  onExport 
}: SidebarProps) => {
  return (
    <div className="w-full md:w-64 bg-gray-200 p-4 flex flex-col h-screen">
      
      
      <div className="flex-1 mt-6 overflow-y-auto">
        <SvgPreviewList 
          svgs={uploadedSvgs}
          onAddToCanvas={onAddToCanvas}
        />
      </div>
      
      <Uploader onSvgUpload={onSvgUpload} />
      <ExportButton onExport={onExport} />
    </div>
  );
};

export default Sidebar;