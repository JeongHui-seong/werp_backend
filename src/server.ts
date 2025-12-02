import express from "express";
import cors from "cors";
import { appRouter } from "./app";

const app = express()

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
}));
app.use(express.json());

app.use("/api", appRouter);

const PORT = 4000;

app.listen(PORT, () => {
    console.log("포트번호 : ", PORT)
})