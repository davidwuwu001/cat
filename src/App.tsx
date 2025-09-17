import React, { useState, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import CropSettings from './components/CropSettings';
import ImagePreview from './components/ImagePreview';
import ActionButtons from './components/ActionButtons';
import { cropImage } from './utils/imageProcessing';

function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [cropSettings, setCropSettings] = useState({
    width: 300,
    height: 300,
    count: 1
  });
  const [croppedImages, setCroppedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false); // 批量处理状态
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setOriginalImage(imageData);
      
      // 获取图片尺寸
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.width,
          height: img.height
        });
        
        // 设置默认裁剪设置
        const defaultCount = Math.ceil(img.height / 300);
        setCropSettings({
          width: 300,
          height: 300,
          count: defaultCount
        });
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
  };

  const handleCropSettingsChange = (settings: typeof cropSettings) => {
    setCropSettings(settings);
  };

  const handleCrop = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const images = await cropImage(
        originalImage,
        cropSettings.width,
        cropSettings.height,
        cropSettings.count
      );
      setCroppedImages(images);
    } catch (error) {
      console.error('裁剪图片时出错:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 批量裁剪图片功能
   * 允许用户上传多张图片并应用相同的裁剪设置
   */
  const handleBatchCrop = async (files: FileList) => {
    if (files.length === 0) return;
    
    setIsBatchProcessing(true);
    try {
      const allCroppedImages: string[] = [];
      
      // 依次处理每张图片
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        // 使用Promise来等待每张图片处理完成
        await new Promise<void>((resolve, reject) => {
          reader.onload = async (e) => {
            try {
              const imageData = e.target?.result as string;
              const images = await cropImage(
                imageData,
                cropSettings.width,
                cropSettings.height,
                cropSettings.count
              );
              allCroppedImages.push(...images);
              resolve();
            } catch (error) {
              console.error(`处理第${i + 1}张图片时出错:`, error);
              reject(error);
            }
          };
          
          reader.onerror = () => {
            reject(new Error(`读取第${i + 1}张图片时出错`));
          };
          
          reader.readAsDataURL(file);
        });
      }
      
      // 更新裁剪后的图片状态
      setCroppedImages(allCroppedImages);
    } catch (error) {
      console.error('批量裁剪图片时出错:', error);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setCroppedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">图片裁剪工具</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            onBatchCrop={handleBatchCrop}
            fileInputRef={fileInputRef}
          />
        </div>
        
        {originalImage && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <CropSettings 
                settings={cropSettings}
                imageDimensions={imageDimensions}
                onSettingsChange={handleCropSettingsChange}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <ImagePreview 
                originalImage={originalImage}
                croppedImages={croppedImages}
                isProcessing={isProcessing}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <ActionButtons 
                onCrop={handleCrop}
                onReset={handleReset}
                isProcessing={isProcessing || isBatchProcessing}
                hasCroppedImages={croppedImages.length > 0}
                croppedImages={croppedImages}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;