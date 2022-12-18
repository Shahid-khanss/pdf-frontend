const express = require("express")
const morgan = require('morgan')
require('dotenv').config()


const app = express()

app.use(morgan("dev"))
app.use("/", express.static("../dist"))


app.use('/*',(req,res)=>{
    res.status(404).json({"Message" : "Page Not Found"})
})

app.listen(3000 || process.env.SERVER,()=>{
    console.log(`Listening to Port 3000`)
})