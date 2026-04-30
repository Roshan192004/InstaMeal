const User = require("../models/User");
const jwt = require("jsonwebtoken");
// TODO: Initialize firebase-admin with your service account
// const admin = require("firebase-admin");
// const serviceAccount = require("../config/firebase-service-account.json");
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

exports.verifyFirebaseToken = async (req, res) => {
  try {
    const { idToken, name } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }

    // TODO: Uncomment when firebase-admin is configured with service account
    // const decoded = await admin.auth().verifyIdToken(idToken);
    // const phone = decoded.phone_number;

    // STUB: For development without firebase-admin service account
    // Replace this block with the real firebase-admin verify above
    const phone = req.body.phone; // Passed directly in dev mode
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name: name || `User_${phone.slice(-4)}`,
        phone,
        role: "customer",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
