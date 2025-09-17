import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onBatchCrop?: (files: FileList) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onBatchCrop, fileInputRef }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 检查是否有批量裁剪功能
    if (files.length > 1 && onBatchCrop) {
      // 批量上传模式
      let allValid = true;
      for (let i = 0; i < files.length; i++) {
        if (files[i].type !== 'image/jpeg' && files[i].type !== 'image/png') {
          allValid = false;
          break;
        }
      }
      
      if (allValid) {
        onBatchCrop(files);
      } else {
        alert('请选择 JPG 或 PNG 格式的图片');
      }
    } else {
      // 单张图片上传模式
      const file = files[0];
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        onImageUpload(file);
      } else {
        alert('请选择 JPG 或 PNG 格式的图片');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      onImageUpload(file);
    } else {
      alert('请选择 JPG 或 PNG 格式的图片');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">上传图片</h2>
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-gray-500 mb-2">拖拽图片到此处或点击选择图片</p>
        <p className="text-sm text-gray-400">支持 JPG、PNG 格式</p>
        <p className="text-sm text-gray-400 mt-2">提示：按住 Ctrl/Cmd 键可选择多张图片进行批量裁剪</p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          multiple // 允许多选
        />
      </div>
    </div>
  );
};

export default ImageUploader;