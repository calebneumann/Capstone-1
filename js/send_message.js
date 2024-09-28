const { SinchClient} = require("@sinch/sdk-core");

const sinchClient = new SinchClient({
    projectId: process.env.SINCH_PROJECT_ID,
    keyId: process.env.SINCH_KEY_ID,
    keySecret: process.env.SINCH_KEY_SECRET
});
async function sendNotif(client, bodyMessage){
    const response = await sinchClient.sms.batches.send({
        sendSMSRequestBody: {
            to: [
                client
            ],
            from: "+12084351902", //these numbers expire every 2 weeks so we'll need to grab another one eventually
            body: bodyMessage
        }
    });

    console.log(JSON.stringify(response));
}

module.exports = { sendNotif };