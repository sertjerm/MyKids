// src/hooks/useNotification.js
import { notification } from 'antd';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';

/**
 * Custom hook for showing notifications with kid-friendly styling
 */
export const useNotification = () => {
  const showSuccess = (title, message, duration = 4) => {
    notification.success({
      message: title,
      description: message,
      duration,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      style: {
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(82, 196, 26, 0.3)',
      }
    });
  };

  const showError = (title, message, duration = 4) => {
    notification.error({
      message: title,
      description: message,
      duration,
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      style: {
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(255, 77, 79, 0.3)',
      }
    });
  };

  const showWarning = (title, message, duration = 4) => {
    notification.warning({
      message: title,
      description: message,
      duration,
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
      style: {
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(250, 173, 20, 0.3)',
      }
    });
  };

  const showInfo = (title, message, duration = 4) => {
    notification.info({
      message: title,
      description: message,
      duration,
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      style: {
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(24, 144, 255, 0.3)',
      }
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useNotification;
