const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 4000


app.use(cors())
app.use(express.json())


app.get('/', (req, res)=>{
    res.send('Hello world BackToOwner server Running')
})

app.listen(port, ()=>{
    console.log(`BackToOwner Server Running PORT: ${port}`)
})