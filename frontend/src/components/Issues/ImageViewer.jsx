import { useState } from "react";

const ImageViewer = ({ imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!imageUrl) {
    return <p className="text-gray-500">No image available</p>;
  }

  const proxyUrl = `${import.meta.env.VITE_API_BASE_URL}/api/media?url=${encodeURIComponent(imageUrl)}`;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Attached Image:</h3>

      <div
        className={`relative rounded-lg overflow-hidden max-w-full max-h-[400px] bg-gray-100 flex items-center justify-center ${
          !isLoading ? "border" : ""
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <img
          src={proxyUrl}
          alt="Issue"
          className={`w-full h-auto object-contain transition-opacity duration-500 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default ImageViewer;
