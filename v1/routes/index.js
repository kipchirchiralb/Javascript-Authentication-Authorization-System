import express from "express"; // import the express module
import Auth from "./auth.js";
import { Verify, VerifyRole } from "../middleware/verify.js";

const app = express(); // Create an app object
app.use(express.json());
app.disable("x-powered-by"); // Reduce fingerprinting (optional)
// home route with the get method and a handler
app.get("/v1", (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      data: [],
      message: "Welcome to our API homepage!",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});
app.use("/v1/auth", Auth);
app.get("/v1/user", Verify, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the your Dashboard!",
  });
});
app.get("/v1/admin", Verify, VerifyRole, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Admin portal!",
  });
});



export default app;
