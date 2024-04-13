import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 * @route POST v1/auth/login
 * @desc logs in a user
 * @access Public
 */
export async function Login(req, res) {
  // Get variables for the login process
  const { email } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({
        status: "failed",
        data: [],
        message:
          "Invalid email or password.email. Please try again with the correct credentials.",
      });
    // if user exists
    // validate password
    const isPasswordValid = bcrypt.compareSync(
      `${req.body.password}`,
      user.password
    );
    // if not valid, return unathorized response
    if (!isPasswordValid)
      return res.status(401).json({
        status: "failed",
        data: [],
        message:
          "Invalid email or password.password. Please try again with the correct credentials.",
      });

    let options = {
      maxAge: 20 * 60 * 1000, // would expire in 20minutes
      httpOnly: true, // The cookie is only accessible by the web server
      secure: true,
      sameSite: "None",
    };
    const token = user.generateAccessJWT(); // generate session token for user
    res.cookie("SessionID", token, options); // set the token to response header, so that the client sends it back on each subsequent request

    // return user info except password
    //  const { password, ...user_data } = user._doc;

    res.status(200).json({
      status: "success",
      message: "You have successfully logged in.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
  res.end();
}

/**
 * @route POST v1/auth/register
 * @desc Registers a user
 * @access Public
 */

export async function Register(req, res) {
  // get required variables from request body
  // using es6 object destructing
  const { first_name, last_name, email, password } = req.body;
  console.log(req.body);
  try {
    // create an instance of a user
    const newUser = new User({
      first_name,
      last_name,
      email,
      password,
    });
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        status: "failed",
        data: [],
        message: "It seems you already have an account, please log in instead.",
      });
    const savedUser = await newUser.save(); // save new user into the database
    const { role, ...user_data } = savedUser._doc;
    res.status(200).json({
      status: "success",
      data: [user_data],
      message:
        "Thank you for registering with us. Your account has been successfully created.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
  res.end();
}
