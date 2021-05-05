const express= require('express');
const { pullMessagesFromQueue } = require('../middleware/sqs');
const { scrapePage } = require('../utils/scrapePage');

const router= new express.Router();

router.post('/start-scarping-page',pullMessagesFromQueue,async(req,res)=>{
    try{
        if(req.messages.length>0){
            let currentLink=req.messages[0].Body
            let page= await scrapePage(currentLink,req.body.depthCounter)
            res.send(page)
        }
        res.send(undefined)

    }catch(err){
        console.log(err)
    }
})

module.exports=router