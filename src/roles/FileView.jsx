import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const FileViewer = ({ 
  width = '100%', 
  height = '600px',
  className = '' 
}) => {
  const [loading, setLoading] = React.useState(true);
const [searchParams] = useSearchParams();
const url = searchParams.get('url');
const type=searchParams.get("type")
  React.useEffect(() => {
    if (url) {
      setLoading(true);
    }
  }, [url]);
  const getGoogleViewerUrl = (url) => {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  };
  const handleLoad = () => {
    setLoading(false);
  };
    console.log(url)

  if (!url) {
    return (
      <div 
        className={`border border-gray-300 rounded bg-gray-50 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-2">📄</div>
          <p>Aucun fichier</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative border border-gray-300 rounded overflow-hidden ${className}`}>
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-white z-10"
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      )}
    {
      !type.startsWith("application/pdf") ? <iframe
        src={()=>getGoogleViewerUrl(url)}
        className="w-full h-full border-0"
        style={{ width, height }}
        title="File viewer"
        onLoad={handleLoad}
      /> :  <iframe
        src={url}
        className="w-full h-full border-0"
        style={{ width, height }}
        title="File viewer"
        onLoad={handleLoad}
      /> 
    }
     
    </div>
  );
};


export default FileViewer;