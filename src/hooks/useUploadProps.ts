import { message, UploadProps } from 'antd';
import { uploadUrl } from '@/utils/uploadUrl';

const useUploadProps = () => {
  const uploadProps: UploadProps = {
    name: 'file',
    action: uploadUrl,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    // beforeUpload: (file) => {
    //   const isPNG = file.type === 'image/png';
    //   if (!isPNG) {
    //     message.error(`${file.name} is not a png file`);
    //   }
    //   return isPNG || Upload.LIST_IGNORE;
    // },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        console.log(info.file.response);
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        console.log(info);
        message.error(info.file.response.message);
        message.error(`${info.file.name} 文件上传失败.`);
      }
    },
    // progress: {
    //   strokeColor: {
    //     '0%': '#108ee9',
    //     '100%': '#87d068',
    //   },
    //   strokeWidth: 3,
    //   format: percent => percent && `${parseFloat(percent.toFixed(2))}%`,
    // },
  };

  return uploadProps;
};

export default useUploadProps;
