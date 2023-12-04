const { Lambda } = require("@aws-sdk/client-lambda");
const lambda = new Lambda();
const sgMail = require("@sendgrid/mail");

require("dotenv").config();

exports.handler = async (event) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // Get daily orders from lambda function
  const params = {
    FunctionName: "queryOrdersFromDB",
    InvocationType: "RequestResponse", // Synchronous invocation
  };
  const result = await lambda.invoke(params);
  const payloadObject = JSON.parse(
    Buffer.from(result.Payload).toString("utf-8")
  );
  const orders = payloadObject.body;

  // Get today's date and weekday
  const today = new Date();
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const date =
    today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate();

  // Send emails
  console.log("[ORDERS]: ", orders);

  const msg = {
    from: "adhc@ccacc-dc.org",
    subject: "Daily Orders of CCACC Meal Delivery",
    templateId: "d-a18a0b7606b245f390290649839a88c7",
    dynamic_template_data: {
      date: date,
      weekday: weekday,
      Items: orders.Items,
    },
    personalizations: [
      {
        to: [
          { email: "jia.yu@ccacc-dc.org" },
          { email: "catherine.shine@ccacc-dc.org" },
          { email: "huaiguo.guan@ccacc-dc.org" },
        ],
        cc: [
          { email: "steve.lin@ccacc-dc.org" },
          { email: "wanchang.chen@ccacc-dc.org" },
          { email: "PaoYu.Tsai@ccacc-dc.org" },
          { email: "Jackie.Yu@ccacc-dc.org" },
          { email: "weihong.ran@ccacc-dc.org " },
          { email: "chenyu.wang@ccacc-dc.org" },
        ],
      },
    ],
  };

  console.log("[MSG]: ", msg);

  try {
    await sgMail.send(msg);
    console.log("[SUCCESS]: Email sent successfully");
    return {
      statusCode: 200,
      body: "Email sent successfully",
    };
  } catch (err) {
    console.log(`[ERROR]: ${err}`);
    return {
      statusCode: 400,
      body: err,
    };
  }
};
