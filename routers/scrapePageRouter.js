const express= require('express');
const { pullMessagesFromQueue } = require('../middleware/sqs');
const { scrapePage } = require('../utils/scrapePage');
const Axios= require('axios')

const router= new express.Router();

let workerResponseUrl=`http://localhost:4040/worker-done`
router.post('/start-scarping-page',pullMessagesFromQueue,async(req,res)=>{
    try{
        console.log("messages in queue-" + req.messages.length)
        if(req.messages.length>0){
            if(!req.body.tree){
                
                let result= await scrapePage(req.messages[0].Body,undefined)
                return res.send(result)
            }
            let pagesScraped=[]

            for(let i=0;i<req.messages.length;i++){
                let currentLink=req.messages[i].Body
                let result= await scrapePage(currentLink,req.body.tree)
                req.body.tree=result.tree
                pagesScraped.push(result.page)
            }
            Axios.post(workerResponseUrl,{pagesScraped,tree:req.body.tree})
            // nn to send rqst to api 
            res.send({pagesScraped,depthCounter:req.body.depthCounter})
        }
        res.send(undefined)

    }catch(err){
        console.log(err)
    }
})

module.exports=router