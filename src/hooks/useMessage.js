// src/hooks/useMessage.js
import { message } from 'antd';

/**
 * Custom hook for showing messages with consistent styling
 */
export const useMessage = () => {
  // Configure global message settings
  message.config({
    top: 100,
    duration: 3,
    maxCount: 3,
  });

  const showSuccess = (content, duration = 3) => {
    return message.success({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  const showError = (content, duration = 3) => {
    return message.error({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  const showWarning = (content, duration = 3) => {
    return message.warning({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  const showInfo = (content, duration = 3) => {
    return message.info({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  const showLoading = (content, duration = 0) => {
    return message.loading({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  };
};

export default useMessage;
