const express  = require("express");
const router = express.Router();

const controller = require("../controllers/textentry.controller");

router.post("/",controller.createtextentry);
router.get("/",controller.getalltextentry);
router.get("/:id",controller.gettextentry);
router.put("/:id",controller.updatetextentry);
router.delete("/:id",controller.deletetextentry);


module.exports = router;