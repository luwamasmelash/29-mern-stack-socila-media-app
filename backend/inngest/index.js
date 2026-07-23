import { Inngest } from "inngest";
import User from "../models/User.js";
import { connectDB } from "../configs/db.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";

export const inngest = new Inngest({
  id: "pingup-app",
});


// Sync user creation
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    trigger: {
      event: "clerk/user.created",
    },
  },
  async ({ event }) => {
    await connectDB();

    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      throw new Error("No email found from Clerk event");
    }

    let username = email.split("@")[0];

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      username = `${username}${Math.floor(Math.random() * 10000)}`;
    }

    await User.create({
      _id: id,
      email,
      full_name:
        `${first_name || ""} ${last_name || ""}`.trim() || username,
      profile_picture: image_url || "",
      username,
    });
  }
);


// Sync user update
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    trigger: {
      event: "clerk/user.updated",
    },
  },
  async ({ event }) => {
    await connectDB();

    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    const email = email_addresses?.[0]?.email_address;

    await User.findByIdAndUpdate(id, {
      email,
      full_name:
        `${first_name || ""} ${last_name || ""}`.trim() || "Unknown User",
      profile_picture: image_url || "",
    });
  }
);


// Sync user deletion
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    trigger: {
      event: "clerk/user.deleted",
    },
  },
  async ({ event }) => {
    await connectDB();

    await User.findByIdAndDelete(event.data.id);
  }
);


// Send connection request reminder
const sendNewConnectionRequestReminder = inngest.createFunction(
  {
    id: "send-new-connection-request-reminder",
    trigger: {
      event: "app/connection-request",
    },
  },
  async ({ event, step }) => {

    const { connectionId } = event.data;

    await step.run(
      "send-connection-request-mail",
      async () => {

        const connection =
          await Connection.findById(connectionId)
          .populate("from_user_id to_user_id");


        const subject = "👋 New Connection Request";


        const body = `
          <div style="font-family: Arial, sans-serif; padding:20px;">
            <h2>
              Hi ${connection.to_user_id.full_name},
            </h2>

            <p>
              You have a new connection request from 
              ${connection.from_user_id.full_name}
              - @${connection.from_user_id.username}
            </p>

            <p>
              Click 
              <a href="${process.env.FRONTEND_URL}/connections">
              here
              </a>
              to accept or reject the request.
            </p>

            <br/>

            <p>
              Thanks,<br/>
              PingUp - Stay Connected
            </p>
          </div>
        `;


        await sendEmail({
          to: connection.to_user_id.email,
          subject,
          body,
        });

      }
    );


    const in24Hours = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );


    await step.sleepUntil(
      "wait-for-24-hours",
      in24Hours
    );


    await step.run(
      "send-connection-request-reminder",
      async () => {

        const connection =
          await Connection.findById(connectionId)
          .populate("from_user_id to_user_id");


        if (connection.status === "accepted") {
          return {
            message: "Already accepted",
          };
        }


        const subject = "👋 Reminder: Connection Request";


        const body = `
          <div style="font-family: Arial, sans-serif; padding:20px;">
            <h2>
              Hi ${connection.to_user_id.full_name},
            </h2>

            <p>
              You still have a pending connection request from
              ${connection.from_user_id.full_name}.
            </p>

            <p>
              Visit your connections page to respond.
            </p>

            <br/>

            <p>
              Thanks,<br/>
              PingUp - Stay Connected
            </p>
          </div>
        `;


        await sendEmail({
          to: connection.to_user_id.email,
          subject,
          body,
        });


        return {
          message: "Reminder sent",
        };
      }
    );
  }
);



export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
];

