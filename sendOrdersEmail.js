const { Lambda } = require("@aws-sdk/client-lambda");
const lambda = new Lambda();
const sgMail = require("@sendgrid/mail");

exports.handler = async (event) => {
  // Get daily orders from lambda function
  const params = {
    FunctionName: "queryOrdersFromDB",
    InvocationType: "RequestResponse", // Synchronous invocation
  };
  const result = await lambda.invoke(params);
  const orders = JSON.parse(result.Payload).body.Items;

  // Get today's weekday
  const today = new Date();
  const weekday = today.toLocaleDateString("en-US", options);
  console.log(weekday);

  // Send emails
  const sendOrdersEmail = (orders) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      from: "hellochenyuw@gmail.com",
      subject: "Daily Orders of CCACC Meal Delivery",
      templateId: "d-a18a0b7606b245f390290649839a88c7",
      dynamic_template_data: {
        date: orders[0].deliveryDate,
        weekday: weekday,
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

    console.log(msg);

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent successfully");
      })
      .catch((error) => {
        console.error(error);
        console.log(error.response.body.errors);
      });
  };

  sendOrdersEmail(orders);

  return {
    statusCode: 200,
    body: JSON.stringify("Email sent successfully"),
  };
};

// [
//   {
//     quantity: 2,
//     clientName: "Mei-Jung  Lin ",
//     deliveryDate: "2023/11/26",
//     wixId: 10121,
//     orderId: "1701015310112crv4umpzjds",
//     notes: "N/A",
//     address:
//       "9808 Glenolden Dr\nPotomac, Maryland 20854-5001\nUnited States\n3013185619",
//     method: "Delivery",
//   },
// ];
