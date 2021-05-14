const express= require('express');
const { pullMessagesFromQueue } = require('../middleware/sqs');
const { scrapePage } = require('../utils/scrapePage');
const Axios= require('axios');
const Tree=require('../models/treeModel')
const router= new express.Router();

let workerResponseUrl=`http://localhost:4040/worker-done`
router.post('/start-scarping-page',pullMessagesFromQueue,async(req,res)=>{
    try{

        if(req.messages.length>0){
            if(!req.body.treeId){
                
                let result= await scrapePage(req.messages[0].Body,undefined)
                return res.send(result)
            }
            let pagesScraped=[]

            for(let i=0;i<req.messages.length;i++){
                let currentLink=req.messages[i].Body
                let result= await scrapePage(currentLink,req.body.treeId)
                pagesScraped.push(result.page)
            }
            let tree= await Tree.findById({_id:req.body.treeId})
            tree.totalPagesScraped=tree.totalPagesScraped+req.messages.length
            await tree.save()
            Axios.post(workerResponseUrl,{pagesScraped,treeId:req.body.treeId})
            // res.send({pagesScraped,depthCounter:req.body.depthCounter})
        }
        // else{
        //     Axios.post(workerResponseUrl,{pagesScraped:[],treeId:req.body.treeId})
        // }
        res.send(undefined)

    }catch(err){
        console.log(err)
    }
})

module.exports=router