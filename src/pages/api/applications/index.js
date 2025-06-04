import { getUserApplications } from "@/lib/firestore";

export default async function handler(req, res) {
  // GET - Retrieve user's applications
 if (req.method === "GET") {
  try {
    const userId = req.query.userId;

    try {
      let applications;
      if (userId) {
        // User ke applications
        console.log("Fetching applications for userId:", userId);
        applications = await getUserApplications(userId);
      } else {
        // Admin ke liye saare applications
        console.log("Fetching all applications (admin)");
        applications = await getUserApplications(); // is function ko update karein agar zarurat ho
      }
      console.log("Found applications in Firestore:", applications.length);

      return res.status(200).json({
        success: true,
        applications: applications,
      });
    } catch (dbError) {
      console.error("Error querying Firestore:", dbError);

      return res.status(500).json({
        success: false,
        message: "Error querying database",
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error("Error in applications API:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

  // POST - Create a new application
  if (req.method === "POST") {
    // This endpoint is not used directly, see submit.js
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use /api/applications/submit instead.",
    });
  }

  // Other methods not allowed
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
}
