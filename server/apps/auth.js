import { Router } from "express";
import { db } from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
  try {
    const user = {
      username: req.body.username,
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    };

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(user.password, salt);

    const collection = db.collection("users");
    await collection.insertOne(user);

    // Chatgpt แนะนำ
    /*     const { username, password, firstname, lastname } = req.body;

    // ตรวจสอบข้อมูลที่ส่งมา
    if (!username || !password || !firstname || !lastname) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่
    const collection = db.collection("users");
    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // แฮชรหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // สร้าง user object
    const user = {
      username,
      password: hashedPassword,
      firstname,
      lastname,
    }; */

    return res.status(201).json({
      message: "User has been created successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: `${error.message}` });
  }
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้
authRouter.post("/login", async (req, res) => {
  try {
    // const { username, password } = req.body;

    /* if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    } */

    const user = await db.collection("users").findOne({
      username: req.body.username,
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({ message: "password is not valid" });
    }
    // เอา username , password มาเช็ค จาก client/context/authentication บรรทัด22 แล้วค่อยสร้าง token แนบกลับไป
    const token = jwt.sign(
      {
        // หรือเรียกว่า payload ก็ได้
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "900000", // สามารถกำหนดเป็น minutes(m), hours(h), days(d), years(y) ได้
      }
    );

    return res.json({
      message: "login successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: `${error.message}` });
  }
});

export default authRouter;
