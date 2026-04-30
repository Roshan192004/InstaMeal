const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../controllers/firebaseAuthController");

router.post("/phone-verify", verifyFirebaseToken);

module.exports = router;
