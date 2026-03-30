import express from "express";
import cors from "cors";
import "dotenv/config"
import multer from "multer";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Port = process.env.PORT
const app = express()

app.use(cors({
  origin: function (origin, callback){
    const allowed = ["http://localhost:5173"]
    if (!origin) {
      return callback(null, true)
    };
    if (allowed.includes(origin)) {
      return callback(null, true)
    };
    return callback(new Error("CORS ERROR"));
  },
  allowedHeaders:["content-Type"],
  methods:["GET", "POST", "PUT", "DELETE"],
  credentials:true
}));

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

/**
 * http://localhost:6300/uploads/image1.jpg  
 * on searching this we will get the image if the image1.jpg is present in uploads folder of the server
*/

app.use("/uploads", express.static(uploadsDir));

const imageCache = new Map();
const friendsMap = new Map([
  ["id1", "id2"],
  ["id2", "id1"],
]);


//MULTER CONFIGS

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (req, file, callback) => {
    const uniqueString = Math.random().toString(36).substring(7);
    const timestamps = Date.now();
    const extension = path.extname(file.originalname);
    const name = path.basename(file.originalname, extension);
    callback(null, `image-${name}-${timestamps}-${uniqueString}-${extension}`)
  }
})

const upload = multer({storage});

app.post("/upload", upload.single("image"), (req,res) => {
  try {
    if (!req.file) {
      return res.status(400).json({success:false, message:"No file uploaded"}); 
    }

    const userId = req.body.userId;
    const imagePath = `/uploads/${req.file.filename}`;
    imageCache.set(userId, imagePath);

    res.json({
      success:true,
      message:"Image uploaded successfully",
      imagePath,
    })
    
  } catch (error) {
    console.log("Upload Error: ", error);
    return res.status(500).json({success:false, message:"Upload Failed"}) 
  }
})

app.get("/drop/:receiverId", (req, res) => {
  try {
    const id = req.params.receiverId;
    const senderId = friendsMap.get(id);

    if (!senderId) {
      return res.json({success:false, message:"No friends mapping found"}) 
    }
  
    const imagePath = imageCache.get(senderId)

    if (!imagePath) {
      return res.json({success:false, message:"No image available from your friend"}) 
    }

    imageCache.delete(senderId);

    res.json({
      success:true,
      message:"Image uploaded successfully",
      imagePath,
    })

  } catch (error) {
    console.log("Upload Error: ", error);
    return res.status(500).json({success:false, message:"Drop Failed"}) 
  }
})

app.get("/", (req, res)=>{
 res.json({message:"working fine"})
})


app.listen(Port, () => {
  console.log(`server listening on port ${Port}`);
  
})