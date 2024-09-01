const { SinchClient} = require("@sinch/sdk-core");

const sinchClient = new SinchClient({
    projectId: process.env.SINCH_PROJECT_ID,
    keyId: process.env.SINCH_KEY_ID,
    keySecret: process.env.SINCH_KEY_SECRET
});
async function run(client, bodyMessage){
    const response = await sinchClient.sms.batches.send({
        sendSMSRequestBody: {
            to: [
                client
            ],
            from: "+12066563055",
            body: bodyMessage
        }
    });

    console.log(JSON.stringify(response));
}
run("+19038208905", "Poopy poopy");