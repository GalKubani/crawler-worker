const AWS= require('aws-sdk')

const sqs=new AWS.SQS({
    apiVersion: "2012-11-05",
    region: process.env.AWS_REGION
})

const pullMessagesFromQueue= async(req,res,next)=>{
    const QueueUrl= req.body.queueUrl
    try{
        const {Messages}=await sqs.receiveMessage({
            QueueUrl,
            MaxNumberOfMessages: 10,
            MessageAttributeNames:[
                "All"
            ],
            VisibilityTimeout:30,
            WaitTimeSeconds:15
        }).promise()
        req.messages=Messages || [];
        next()

        if(Messages){
            const messagesDeleteFunc=Messages.map(message=>{
                return sqs.deleteMessage({
                    QueueUrl,
                    ReceiptHandle: message.ReceiptHandle
                }).promise()
            })
            Promise.allSettled(messagesDeleteFunc)
            .then(data=>console.log(data))
        }
    }catch(err){
        console.log(err)
    }
}
module.exports={
    pullMessagesFromQueue
}