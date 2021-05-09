const cheerio=require('cheerio')
const redisClient=require('../../crawler-api/src/db/redis')
const Axios=require('axios')

const scrapePage=async (url,depthCounter,QueueName)=>{
    let pageData={}
 
    let pageUrl=url?.Body|| url;
    if(!pageUrl.includes("https://")){pageUrl="https://"+pageUrl}
    try{
        const res= await Axios.get(pageUrl)
        if(res.status===200){pageData=res.data}
    }catch(err){
        return undefined
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
        pageDepth:depthCounter,
        pageUrl,
        pageLinks
    }
    try{    
        redisClient.setexAsync(
            "Scraped page from Queue: "+QueueName+" - "+pageTitle+" - "+depthCounter,
            2400,
            JSON.stringify(page)
        )
    }catch(err){
        console.log(err)
        return undefined
    }
    return page
}

module.exports={scrapePage}