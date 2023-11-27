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
  console.log("orders: ", orders);

  const msg = {
    from: "hellochenyuw@gmail.com",
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
          { email: "hellochenyuw@gmail.com" },
          { email: "jadeyw7@gmail.com" },
        ],

        cc: [{ email: "chenyu.wang@ccacc-dc.org" }],
      },
    ],
  };

  console.log("msg: ", msg);

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
    return {
      statusCode: 200,
      body: "Email sent successfully",
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 400,
      body: err,
    };
  }
};
