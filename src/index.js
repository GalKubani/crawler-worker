const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 3000

const app = express()
require('./db/mongoose')
const scrapeRouter = require('./routers/scrapePageRouter')
app.use(cors())
app.use(express.json())
app.use(scrapeRouter)
app.use('/', (req, res) => {
    res.send("ok")
})

app.listen(port, () => console.log("server on port:", port))