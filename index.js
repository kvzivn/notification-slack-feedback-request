import { Client, Databases, Messaging, ID } from "node-appwrite"
import axios from "axios"

export default async ({ req, res, log, error }) => {
  const {
    stakeholderId,
    feedbackType,
    industry,
    expertise,
    numberOfExperts,
    timeFrame,
    stripeLink,
    eukapayLink,
  } = req.body
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL

  try {
    const client = new Client()
    client
      .setEndpoint("https://appwrite.teamspark.xyz/v1")
      .setProject("spark-net-app")
      .setKey(process.env.APPWRITE_API_KEY)

    const databases = new Databases(client)
    const messaging = new Messaging(client)

    const { firstName, lastName, email, accountId } =
      await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_STAKEHOLDER_COLLECTION_ID,
        stakeholderId
      )

    log(`Stakeholder ID: ${stakeholderId}`)
    log(`Account ID: ${accountId}`)
    log(`First name: ${firstName}`)
    log(`Last name: ${lastName}`)
    log(`Email: ${email}`)
    log(`Feedback type: ${feedbackType}`)
    log(`Industry: ${industry}`)
    log(`Expertise: ${expertise}`)
    log(`Number of experts: ${numberOfExperts}`)
    log(`Time frame: ${timeFrame}`)
    log(`Stripe link: ${stripeLink}`)
    log(`Eukapay link: ${eukapayLink}`)

    const slackMessage = `We have a new feedback request!\n- First name: ${firstName}\n- Last name: ${lastName}\n- Email: ${email}${
      industry ? `\n- Industry: ${industry}` : ""
    }${feedbackType ? `\n- Feedback type${feedbackType}` : ""}
    ${expertise ? `\n- Expertise needed: ${expertise}` : ""}
      ${numberOfExperts ? `\n- Number of experts: ${numberOfExperts}` : ""}
      ${timeFrame ? `\n- When: ${timeFrame}` : ""}`

    await messaging.createEmail(
      ID.unique(),
      "TeamSpark Feedback Session",
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TeamSpark</title>
    <style>
      .header {
        max-width: 570px;
        margin: 0 auto;
        padding: 20px;
      }
      .header img {
        max-width: 100%;
        height: auto;
        margin: 0;
        padding: 0;
        border-radius: 8px;
      }
      .content {
        max-width: 570px;
        margin: 0 auto;
        padding: 0 20px 10px;
        font-family: Inter, "San Francisco", Helvetica, Arial, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        color: #544a43;
      }
      .footer {
        max-width: 570px;
        margin: 0 auto;
        padding: 0 20px 20px;
        font-family: Inter, "San Francisco", Helvetica, Arial, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        color: #544a43;
      }
      .footer img {
        max-width: 100%;
        height: auto;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <img
        src="https://cloud.appwrite.io/v1/storage/buckets/65dc899a9a558155ff9b/files/66b4ba630016ec477040/view?project=spark-net-app"
        alt="teamspark"
      />
    </div>
    <div class="content">
      <p>Hello ${firstName},</p>
      <p>
        Thank you for your ordering a feedback session with TeamSpark!
      </p>
      <p>Here are the details you provided:</p>
    <ul>
        <li><strong>Feedback type:</strong> ${feedbackType}</li>
        <li><strong>Industry:</strong> ${industry}</li>
        <li><strong>Expertise requested:</strong> ${expertise}</li>
        <li><strong>Number of experts:</strong> ${numberOfExperts}</li>
        <li><strong>When:</strong> ${timeFrame}</li>
    </ul>

    <p>If you didn't complete your payment, please use one of the following links:</p>

    <p>
      <a
        href="${stripeLink}"
          target="_blank"
          style="
            display: block;
            width: fit-content;
            color: #d34c1f;
            text-decoration: underline;
            margin: 0;
            padding: 0;
          ">
        Pay with Stripe
      </a>
      <a
        href="${eukapayLink}"
        target="_blank"
        style="
          display: block;
          width: fit-content;
          color: #d34c1f;
          text-decoration: underline;
          margin: 0;
          padding: 0;
      ">
        Pay with Crypto
      </a>
    </p>

    <p>If you have any questions or need to make changes to your order, don't hesitate to contact us.</p>

    <p>We look forward to providing you with valuable feedback on your project!</p>

    </div>

    <div class="footer">
      <p>Jason Goodman<br />Founder & CEO</p>
      <p>
        <img
          src="https://cloud.appwrite.io/v1/storage/buckets/65dc899a9a558155ff9b/files/66b4be6200076caec304/view?project=spark-net-app"
          width="90"
          alt="jason"
        />
      </p>
      <p>
        <a
          href="https://x.com/jgoodspark"
          target="_blank"
          style="
            display: block;
            width: fit-content;
            color: #d34c1f;
            text-decoration: underline;
            margin: 0;
            padding: 0;
          "
          >@jgoodspark</a
        >
        <a
          href="https://teamspark.xyz"
          target="_blank"
          style="
            display: block;
            width: fit-content;
            color: #d34c1f;
            text-decoration: underline;
            margin: 0;
            padding: 0;
          "
          >teamspark.xyz</a
        >
      </p>
    </div>
  </body>
</html>`, // content
      [], // topics (optional)
      [accountId], // users (optional)
      [], // targets (optional)
      [], // cc (optional)
      [], // bcc (optional)
      [], // attachments (optional)
      false, // draft (optional)
      true // html (optional)
    )

    // await axios.post(slackWebhookUrl, {
    //   text: slackMessage,
    // })
  } catch (e) {
    error("Failed to send message: " + e.message)
    return res.send("Failed to send message")
  }

  return res.empty()
}
