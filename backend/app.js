const express=require("express");
const mongoose=require("mongoose");
const cors = require('cors');
require("dotenv").config();

const patientRoutes = require('./routes/patientRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/patients', patientRoutes);
// app.use("/", (req, res, next)=>{
//     res.send("Test");
// })

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));
