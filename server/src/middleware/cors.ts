import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*'
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
};

export default cors(corsOptions);
