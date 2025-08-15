const express=require('express');
const mongoose=require('mongoose');
require('dotenv').config();

const app=express();
const port=process.env.PORT ||4000;


const userRoute=require('./routes/authRoutes')

app.use(express.json());
app.use('/api/User',userRoute);


async function connectDb() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    });
}

    catch(err){
        console.log(err);
    }
}
connectDb();