import React from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ActionButtonsProps {
  onCrop: () => void;
  onReset: () => void;
  isProcessing: boolean;
  hasCroppedImages: boolean;
  croppedImages: string[];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onCrop, onReset, isProcessing, hasCroppedImages, croppedImages }) => {
  const [isCompressing, setIsCompressing] = React.useState(false);
  
  const handleDownload = (image: string, index: number) => {
    const link = document.createElement('a');
    link.href = image;
    link.download = `cropped-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (croppedImages.length === 0) return;
    
    try {
      // 创建一个zip文件
      const zip = new JSZip();
      
      // 将所有图片添加到zip文件中
      for (let i = 0; i < croppedImages.length; i++) {
        const imageData = croppedImages[i];
        const response = await fetch(imageData);
        const blob = await response.blob();
        zip.file(`cropped-image-${i + 1}.png`, blob);
      }
      
      // 生成zip文件并下载
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'cropped-images.zip');
    } catch (error) {
      console.error('批量下载失败:', error);
      alert('批量下载失败，请重试');
    }
  };

  const handleCompressAndDownload = async (image: string, index: number) => {
    setIsCompressing(true);
    try {
      // 将 base64 转换为 Blob
      const response = await fetch(image);
      const blob = await response.blob();
      
      // 创建一个File对象用于压缩
      const file = new File([blob], `image-${index + 1}.png`, { type: blob.type });
      
      // 压缩图片
      const compressedBlob = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      });
      
      // 创建下载链接
      const compressedUrl = URL.createObjectURL(compressedBlob);
      const link = document.createElement('a');
      link.href = compressedUrl;
      link.download = `compressed-cropped-image-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(compressedUrl);
    } catch (error) {
      console.error('压缩图片时出错:', error);
      alert('图片压缩失败，请重试');
    } finally {
      setIsCompressing(false);
    }
  };

  /**
   * 批量压缩并下载所有图片
   * 将所有图片压缩后打包成zip文件下载
   */
  const handleCompressAndDownloadAll = async () => {
    if (croppedImages.length === 0) return;
    
    setIsCompressing(true);
    try {
      // 创建一个zip文件
      const zip = new JSZip();
      
      // 依次处理每张图片的压缩
      for (let i = 0; i < croppedImages.length; i++) {
        const imageData = croppedImages[i];
        
        // 将 base64 转换为 Blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        // 创建一个File对象用于压缩
        const file = new File([blob], `image-${i + 1}.png`, { type: blob.type });
        
        // 压缩图片
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });
        
        // 将压缩后的图片添加到zip文件中
        zip.file(`compressed-cropped-image-${i + 1}.jpg`, compressedBlob);
      }
      
      // 生成zip文件并下载
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'compressed-cropped-images.zip');
    } catch (error) {
      console.error('批量压缩下载失败:', error);
      alert('批量压缩下载失败，请重试');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">操作</h2>
      
      <div className="flex flex-wrap gap-4">
        <button
          onClick={onCrop}
          disabled={isProcessing}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? '裁剪中...' : '裁剪图片'}
        </button>
        
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          重置
        </button>
      </div>
      
      {hasCroppedImages && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleDownloadAll}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              批量下载
            </button>
            
            <button
              onClick={handleCompressAndDownloadAll}
              disabled={isCompressing}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCompressing ? '压缩中...' : '压缩并下载全部'}
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>点击下方按钮可单独下载或压缩:</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {croppedImages.map((image, index) => (
              <div key={index} className="flex gap-2">
                <button
                  onClick={() => handleDownload(image, index)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  下载 {index + 1}
                </button>
                <button
                  onClick={() => handleCompressAndDownload(image, index)}
                  disabled={isCompressing}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  压缩 {index + 1}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;