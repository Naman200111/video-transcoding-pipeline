import express from 'express';
import routes from './routes/routes';
import cors from 'cors';

const PORT = 8000;
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});