const express = require("express");
const app = express();
const { connectDB } = require("./database");

const authRouter = require("./routers/authRouter");
const userRouter = require("./routers/userRouter");
const opportunityRouter = require("./routers/opportunityRouter");
const applicationRouter = require("./routers/applicationRouter");
const adminRouter = require("./routers/adminRouter");

connectDB();

app.use(express.json());


app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "success", 
    message: "API is running" 
  });
});


app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/opportunities", opportunityRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({ 
    status: "fail", 
    message: `Route ${req.method} ${req.originalUrl} not found` 
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port 3000`);
});