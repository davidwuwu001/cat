import React from 'react';

interface ImagePreviewProps {
  originalImage: string;
  croppedImages: string[];
  isProcessing: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ originalImage, croppedImages, isProcessing }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">图片预览</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-600">原图</h3>
        <div className="flex justify-center">
          <img 
            src={originalImage} 
            alt="Original" 
            className="max-w-full max-h-96 object-contain border border-gray-200 rounded"
          />
        </div>
      </div>
      
      {isProcessing && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {croppedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">裁剪结果</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {croppedImages.map((image, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={image} 
                  alt={`Cropped ${index + 1}`} 
                  className="w-full object-contain cropped-image"
                />
                <div className="bg-gray-50 px-3 py-2 text-center">
                  <p className="text-sm text-gray-600">片段 {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;