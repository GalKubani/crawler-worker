const cheerio=require('cheerio')
const redisClient=require('../../crawler-api/src/db/redis')
const Axios=require('axios')

const scrapePage=async (url,tree)=>{


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
    if(tree==undefined){ 
        tree = createNewTree(page)
        return tree
    }
    else{
        try{    
            console.log("updating tree")
            tree=updateTree(tree,page)
            console.log("storing page on db")
            redisClient.setexAsync(
                "Scraped page - "+pageTitle,
                2400,
                JSON.stringify(page)
            )
        }catch(err){
            console.log(err)
            return undefined
        }
    }
    return {page,tree}
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
        treeChildren
    }
    try{
        await redisClient.setexAsync(
            "Scraped tree - "+page.pageUrl,
            2400,
            JSON.stringify(newTree)
        )
        return newTree
    }catch(err){
        console.log(err)
    }
    
}
const updateTree=(tree,pageToUpdate)=>{
    let updatedTree=tree
    updatedTree.treeChildren.map((node)=>{
        if(node.link===pageToUpdate.pageUrl){
            for(let link of pageToUpdate.pageLinks){
                node.children.push({link,children:[]})
            }
        }
    })
    try{
        redisClient.setexAsync(
            "Scraped tree - "+tree.pageUrl,
            2400,
            JSON.stringify(updatedTree)
        )
    }catch(err){
        console.log(err)
    }
    return updatedTree
}
module.exports={scrapePage}