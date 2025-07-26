import "../constant/env";
import express from 'express';
import listEndpoints from 'express-list-endpoints';

import router from './apis';
import connectDB from './config/database';


const app = express();

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api', router);


// list endpoints
console.log('-----------------------------------------')
listEndpoints(app).forEach(c => {
  console.log(`${c.methods.join(',')} -> ${c.path}`)
})
console.log('-----------------------------------------')

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
}; /** patch big int https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-953187833 */
