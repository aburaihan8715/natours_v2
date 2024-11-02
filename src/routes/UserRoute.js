import express from 'express';
import { UserController } from '../controllers/userController.js';

const router = express.Router();

router.get(
  '/top-5-users',
  UserController.getAllUsers,
  UserController.getAllUsers,
);

router.route('/').get(UserController.getAllUsers);
router
  .route('/:id')
  .get(UserController.getSingleUser)
  .delete(UserController.deleteUser);

router.route('/user-stats').get(UserController.getUserStats);

export const UserRoutes = router;

/*
import express from "express";
import { verifyTokenAndAdmin, verifyTokenAndAuthorization } from "./verifyToken.js";
import { User } from "../models/User.js";
import CryptoJS from "crypto-js";

const router = express.Router();

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json({ status: "success", message: "user updated!", data: updatedUser });
  } catch (err) {
    res.status(500).json({ status: "error", message: "server error" + err });
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success", message: "user deleted!", data: deletedUser });
  } catch (err) {
    res.status(500).json({ status: "error", message: "server error" + err });
  }
});

//GET A USER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json({ status: "success", message: "user returned!", data: others });
  } catch (err) {
    res.status(500).json({ status: "error", message: "server error" + err });
  }
});

//GET ALL USER
// TODO: have to (verifyTokenAndAdmin)
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const qNew = req.query.new;
  try {
    const users = qNew ? await User.find().sort({ _id: -1 }).limit(4) : await User.find();
    res.status(200).json({ status: "success", result: users.length, message: "user returned!", data: users });
  } catch (err) {
    res.status(500).json({ status: "error", message: "server error" + err });
  }
});

//GET USER STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({ status: "success", message: "stats returned!", data: data });
  } catch (err) {
    res.status(500).json({ status: "error", message: "server error" + err });
  }
});

export { router as userRoute };
*/
