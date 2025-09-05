// Database configuration
const dbConfig = {
  host: process.env.REACT_APP_DB_HOST || 'localhost',
  user: process.env.REACT_APP_DB_USER || 'root',
  password: process.env.REACT_APP_DB_PASSWORD || '',
  database: process.env.REACT_APP_DB_NAME || 'mykids_db',
  port: process.env.REACT_APP_DB_PORT || 3306,
};

export default dbConfig;
