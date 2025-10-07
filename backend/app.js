const express=require("express");
const mongoose=require("mongoose");
require("dotenv").config();

const app = express();

app.use("/", (req, res, next)=>{
    res.send("Test");
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));
