import { createClerkClient } from '@clerk/clerk-sdk-node';
import "dotenv/config"; // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY

export const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
