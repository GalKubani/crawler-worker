const express= require('express');
const { pullMessagesFromQueue } = require('../middleware/sqs');
const { scrapePage } = require('../utils/scrapePage');

const router= new express.Router();

router.post('/start-scarping-page',pullMessagesFromQueue,async(req,res)=>{
    try{
        let page
        await req.messages.map(async(link)=>{
            await scrapePage(link,req.body.depthCounter)
            .then((scrapedPage)=>{
                console.log(scrapedPage)
                page=scrapedPage
            })
        })
        console.log(page)
        res.send(page)
    }catch(err){
        console.log(err)
    }
})

module.exports=router