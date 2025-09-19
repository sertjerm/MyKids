// src/config/antdConfig.js
import { ConfigProvider } from 'antd';
import th_TH from 'antd/locale/th_TH';

export const antdConfig = {
  locale: th_TH,
  theme: {
    token: {
      // Primary colors - Pastel rainbow theme
      colorPrimary: '#a855f7', // Purple
      colorSuccess: '#10b981', // Emerald  
      colorWarning: '#f59e0b', // Amber
      colorError: '#ef4444',   // Red
      colorInfo: '#3b82f6',    // Blue
      
      // Border radius
      borderRadius: 16,
      borderRadiusLG: 20,
      borderRadiusXS: 8,
      
      // Font family
      fontFamily: '"Sarabun", system-ui, -apple-system, sans-serif',
      
      // Colors for kid-friendly interface
      colorBgContainer: '#ffffff',
      colorBgElevated: '#fafafa',
      
      // Component specific tokens
      Button: {
        borderRadius: 12,
        controlHeight: 40,
      },
      
      Card: {
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }
    },
    
    components: {
      Button: {
        borderRadius: 12,
        controlHeight: 40,
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      
      Card: {
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        headerBg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      },
      
      Avatar: {
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }
    }
  }
};

export default antdConfig;
