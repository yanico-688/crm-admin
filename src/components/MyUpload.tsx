import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import { UploadProps } from 'antd/lib/upload/interface';
import { useIntl } from '@umijs/max';

interface MyUploadProps {
  onFileUpload: (url: string) => void;
  accept?: string; // 使accept属性可选
  defaultFileList?: any;
  multiple?: boolean;
}

const MyUpload: React.FC<MyUploadProps> = ({ onFileUpload, accept, defaultFileList, multiple }) => {
  const intl = useIntl();
  // 定义默认的accept值
  const defaultAccept = '.png,.jpeg,.jpg,.gif';

  const customRequest = async (options: any) => {
    const { onSuccess, onError } = options;
    const formData = new FormData();
    if (Array.isArray(options.file)) {
      options.file.forEach((file: any) => {
        formData.append('file', file);
      });
    } else {
      formData.append('file', options.file);
    }

    try {
      const response = await request<{ success: boolean; data: any }>('/upload', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });

      console.log('response:', response);

      if (response.success) {
        message.success('上传成功');
        if (onSuccess) {
          onSuccess(response);
        }
        const httpUrl = response.data.singedUrl; // 假设返回的signedURL就在data字段中
        onFileUpload(httpUrl);
      } else {
        message.error('上传失败');
        if (onError) {
          onError(new Error('上传失败'));
        }
      }
    } catch (error) {
      message.error('上传异常');
      if (onError) {
        onError(new Error('上传异常'));
      }
    }
  };

  const props: UploadProps = {
    name: 'file',
    multiple: multiple,
    customRequest,
    showUploadList: true,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <Upload.Dragger
      {...props}
      listType="picture"
      showUploadList={{ showRemoveIcon: true }}
      multiple={multiple}
      accept={accept || defaultAccept}
      maxCount={multiple ? undefined : 1}
      defaultFileList={defaultFileList}
      style={{ width: 328 }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{intl.formatMessage({ id: 'upload.text' })}</p>
      <p className="ant-upload-hint">{intl.formatMessage({ id: 'upload.hint' })}</p>
    </Upload.Dragger>
  );
};

export default MyUpload;
