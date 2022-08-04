const express = require("express")
const app = express()

let server = app.listen(4000, () =>{
    console.log("server is running")
})

app.use(express.static("public"))

