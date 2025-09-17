import React from 'react';

interface CropSettingsProps {
  settings: {
    width: number;
    height: number;
    count: number;
  };
  imageDimensions: {
    width: number;
    height: number;
  };
  onSettingsChange: (settings: CropSettingsProps['settings']) => void;
}

const CropSettings: React.FC<CropSettingsProps> = ({ settings, imageDimensions, onSettingsChange }) => {
  // 为每个输入框维护一个本地状态，允许输入框为空
  const [localWidth, setLocalWidth] = React.useState<string>('');
  const [localHeight, setLocalHeight] = React.useState<string>('');
  const [localCount, setLocalCount] = React.useState<string>('');
  const [useOriginalWidth, setUseOriginalWidth] = React.useState<boolean>(true);

  // 当settings变化时，更新本地状态
  React.useEffect(() => {
    setLocalWidth(settings.width.toString());
    setLocalHeight(settings.height.toString());
    setLocalCount(settings.count.toString());
  }, [settings]);

  // 当原图尺寸变化时，如果使用原图宽度，则更新宽度设置
  React.useEffect(() => {
    if (useOriginalWidth) {
      const newWidth = imageDimensions.width;
      setLocalWidth(newWidth.toString());
      onSettingsChange({ ...settings, width: newWidth });
    }
  }, [useOriginalWidth, imageDimensions.width]);

  // 当高度改变时，自动计算裁剪数量
  React.useEffect(() => {
    if (settings.height > 0) {
      const count = Math.ceil(imageDimensions.height / settings.height);
      setLocalCount(count.toString());
      onSettingsChange({ ...settings, count });
    }
  }, [settings.height, imageDimensions.height]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalWidth(value);
    
    if (value === '') {
      // 允许用户清空输入框，但内部状态保持为1
      onSettingsChange({ ...settings, width: 1 });
    } else {
      const width = Math.max(1, parseInt(value) || 1);
      onSettingsChange({ ...settings, width });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalHeight(value);
    
    if (value === '') {
      // 允许用户清空输入框，但内部状态保持为1
      onSettingsChange({ ...settings, height: 1 });
    } else {
      const height = Math.max(1, parseInt(value) || 1);
      onSettingsChange({ ...settings, height });
    }
  };

  // 切换使用原图宽度选项
  const toggleUseOriginalWidth = () => {
    const newUseOriginalWidth = !useOriginalWidth;
    setUseOriginalWidth(newUseOriginalWidth);
    
    if (newUseOriginalWidth) {
      // 使用原图宽度
      const newWidth = imageDimensions.width;
      setLocalWidth(newWidth.toString());
      onSettingsChange({ ...settings, width: newWidth });
    }
  };

  // 计算最大裁剪数量
  const maxCount = Math.ceil(imageDimensions.height / settings.height);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">裁剪设置</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              裁剪宽度 (px)
            </label>
            <div className="ml-4 flex items-center">
              <input
                type="checkbox"
                id="useOriginalWidth"
                checked={useOriginalWidth}
                onChange={toggleUseOriginalWidth}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useOriginalWidth" className="ml-2 block text-sm text-gray-700">
                使用原图宽度
              </label>
            </div>
          </div>
          <input
            type="number"
            min="1"
            max={imageDimensions.width}
            value={localWidth}
            onChange={handleWidthChange}
            disabled={useOriginalWidth}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${useOriginalWidth ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          <p className="mt-1 text-xs text-gray-500">原图宽度: {imageDimensions.width}px</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            裁剪高度 (px)
          </label>
          <input
            type="number"
            min="1"
            max={imageDimensions.height}
            value={localHeight}
            onChange={handleHeightChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">原图高度: {imageDimensions.height}px</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            裁剪数量
          </label>
          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
            <span className="text-gray-700">{settings.count}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">根据高度自动计算</p>
        </div>
      </div>
    </div>
  );
};

export default CropSettings;