const cheerio=require('cheerio')
const redisClient=require('../db/redis')
const Axios=require('axios')
const Tree=require('../models/treeModel')

const scrapePage=async (url,treeId)=>{


    let pageData={}
    let pageUrl=url?.Body|| url;

    if(!pageUrl.includes("https://")){pageUrl="https://"+pageUrl}
    try{
        const res= await Axios.get(pageUrl)
        if(res.status===200){pageData=res.data}
    }catch(err){
        return url
    }
    const $= cheerio.load(pageData);  
    let pageLinks=[]
    $('a').each((i,el)=>{
        const link= $(el).attr('href')
        if(link?.includes(`https://`)){
            pageLinks.push(link)
        }    
    })
    const pageTitle=$('title').text()
    page={
        pageTitle,
        pageUrl,
        pageLinks
    }
    if(treeId==undefined){ return await createNewTree(page)}
    else{
        try{    
            redisClient.setexAsync(
                "Scraped page - "+pageTitle,
                2400,
                JSON.stringify(page)
            )
            updateTree(treeId,page)
        }catch(err){
            console.log(err)
            return undefined
        }
    }

    return {page,treeId}
}
const createNewTree=async (page)=>{
    let pageLinks=page.pageLinks
    let treeChildren=[]
    for(let link of pageLinks){
        treeChildren.push({link,children:[]})
    }
    let newTree={
        pageTitle:page.pageTitle,
        pageUrl:page.pageUrl,
        totalPagesScraped:1,
        treeChildren
    }
    try{
        newTree= new Tree(newTree)
        await newTree.save()
        return newTree
    }catch(err){
        console.log(err)
    }
    
}
const updateTree= async(treeId,pageToUpdate)=>{
    try{
        let updatedTree= await Tree.findById({_id:treeId})
        updatedTree.treeChildren.map((node)=>{
            if(node.link===pageToUpdate.pageUrl){
                for(let link of pageToUpdate.pageLinks){
                    node.children.push({link,children:[]})
                }
            }
        })
        await updatedTree.save()
        return updatedTree
    }catch(err){
        console.log(err)
    }

}
module.exports={scrapePage}