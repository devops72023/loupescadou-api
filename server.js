import express from "express";
import Cors from "cors";
import mongoose from "mongoose";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import { config } from "dotenv";
import UsersModel from "./Models/user.js";
import { createProxyMiddleware } from "http-proxy-middleware";
config();

const app = express();

// DB connection
try {
  const db = await mongoose.connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("db connected");
} catch (err) {
  console.log(process.env.MONGO_DB_URI);
  console.log(`Error connecting to the database:\n ${err}`);
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User Connected :" + socket.id);
  socket.on("connection-success", async ({ adminId }) => {
    console.log("Admin Connected :" + adminId);
    await UsersModel.findOneAndUpdate(
      { _id: adminId },
      { $set: { socket: socket.id } },
      { new: true }
    );
  });

  // {
  //   from: Contain the socketID for the sender
  //   to: Contain the socketID for the receiver
  //   sdp: The session description for webrtc connection
  // }

  socket.on("call", ({ from, to, user_id }) => {
    socket.to(to).emit("call", { from, user_id });
  });

  socket.on("call-answer", ({ from, to, answer }) => {
    socket.to(to).emit("call-answer", { from, answer });
  });

  socket.on("sdp", ({ from, to, sdp }) => {
    socket.to(to).emit("sdp", { from, sdp });
  });

  socket.on("candidate", ({ from, to, candidate }) => {
    socket.to(to).emit("candidate", { from, candidate });
  });

  // The chat events:
  socket.on("message", ({ from, to, message})=>{
    console.log("message from: ", from + ", to: ", to + ", message: ", message);
    socket.to(to).emit("message", { from, message });
  })

  socket.on("end-call", ({ to }) => {
    socket.to(to).emit("end-call");
  });

  socket.on("disconnect", async () => {
    console.log(" disconnected socket " + socket.id);
    await UsersModel.findOneAndUpdate(
      { socket: socket.id },
      { $set: { socket: "" } },
      { new: true }
    );
  });
});

// Import different routes
import AuthRouter from "./Routes/Auth.js";
import userRoute from "./Routes/Users.js";
import productsRouter from "./Routes/Products.js";
import categoryRouter from "./Routes/Category.js";
import settingRouter from "./Routes/Setting.js";
import couponRouter from "./Routes/Coupon.js";
import ordersRoute from "./Routes/Orders.js";
import adminRouter from "./Routes/Admin.js";
import stripeRouter from "./Routes/Stripe.js";
import webhook from "./Routes/webhook.js";

// The cors middleware configuration.
const corsOptions = {
  origin: "*", // Allow requests from a specific origin
  methods: "*", // Allow only specified HTTP methods
  allowedHeaders: "*", // Allow only specified headers
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.post('/api/webhook', webhook)

app.use(express.json());
app.use(Cors(corsOptions));
app.use(express.static(path.join(__dirname, "Assets")));
app.use("/src/assets", express.static(path.join(__dirname, "/dist/assets")));

app.use("/api/", stripeRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/users", userRoute);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/settings", settingRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/orders", ordersRoute);
app.use("/api/admin", adminRouter);
app.get("/api/availableAdmin", async (req, res) => {
  try {
    const admin = await UsersModel.findOne({ socket: { $ne: "" } });
    if (admin.socket) {
      res.status(200).json({ available: true, socket: admin.socket });
    } else {
      res.status(200).json({ available: false });
    }
  } catch (error) {
    res.status(200).json({ available: false, error: error.message });
  }
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/dist/index.html'));
});

// app.use(
//   "*", // Specify the endpoint in your Express server to proxy requests
//   createProxyMiddleware({
//     target: "http://localhost:5173", // Specify the address of your Vite server
//     changeOrigin: true,
//     secure: false,
//   })
// );

server.listen(8080, () => console.log("Server listening on port 8080"));
