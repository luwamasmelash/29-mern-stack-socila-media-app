import { Inngest } from "inngest";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

export const inngest = new Inngest({
  id: "pingup-app",
});


// Sync user creation
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: {
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

    console.log("Saving user:", {
      id,
      email,
      username,
    });

    await User.create({
      _id: id,
      email,
      full_name: `${first_name || ""} ${last_name || ""}`.trim(),
      profile_picture: image_url,
      username,
    });
  }
);


// Sync user update
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: {
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
      full_name: `${first_name || ""} ${last_name || ""}`.trim(),
      profile_picture: image_url,
    });
  }
);


// Sync user deletion
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: {
      event: "clerk/user.deleted",
    },
  },
  async ({ event }) => {
    await connectDB();

    await User.findByIdAndDelete(event.data.id);
  }
);


export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
];