/**
 * 裁剪图片函数
 * @param imageData 图片数据URL
 * @param cropWidth 裁剪宽度
 * @param cropHeight 裁剪高度
 * @param count 裁剪数量
 * @returns 裁剪后的图片数组
 */
export const cropImage = (
  imageData: string,
  cropWidth: number,
  cropHeight: number,
  count: number
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const croppedImages: string[] = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('无法获取canvas上下文'));
          return;
        }
        
        // 计算实际裁剪尺寸
        const actualCropWidth = Math.min(cropWidth, img.width);
        const actualCropHeight = Math.min(cropHeight, img.height);
        
        // 设置canvas尺寸
        canvas.width = actualCropWidth;
        canvas.height = actualCropHeight;
        
        for (let i = 0; i < count; i++) {
          // 计算裁剪位置
          const y = i * actualCropHeight;
          
          // 如果超出图片范围，则跳过
          if (y >= img.height) break;
          
          // 清空canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 计算实际绘制高度（最后一张图片可能不足设定高度）
          const drawHeight = Math.min(actualCropHeight, img.height - y);
          
          // 调整canvas高度以适应最后一张图片
          if (i === count - 1 && drawHeight < actualCropHeight) {
            canvas.height = drawHeight;
          }
          
          // 绘制裁剪区域
          ctx.drawImage(
            img,
            0, // source x
            y, // source y
            actualCropWidth, // source width
            drawHeight, // source height
            0, // destination x
            0, // destination y
            actualCropWidth, // destination width
            drawHeight // destination height
          );
          
          // 导出图片
          const dataUrl = canvas.toDataURL('image/png');
          croppedImages.push(dataUrl);
        }
        
        resolve(croppedImages);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };
    
    img.src = imageData;
  });
};