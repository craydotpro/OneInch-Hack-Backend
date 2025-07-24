import express from 'express';
import connectDB from './config/database';

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
// app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
}; /** patch big int https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-953187833 */
