interface ExportButtonProps {
    onExport: () => void;
  }
  
  const ExportButton = ({ onExport }: ExportButtonProps) => {
    return (
      <button
        onClick={onExport}
        className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
      >
        Export Layout
      </button>
    );
  };
  
  export default ExportButton;