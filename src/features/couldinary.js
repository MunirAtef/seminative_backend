//
//
// import {v2 as cloudinary} from 'cloudinary';
//
// const upload = async function () {
//
//     // Configuration
//     cloudinary.config({
//         cloud_name: 'dyo1wxvoc',
//         api_key: '556374454877768',
//         api_secret: 'gWH6RU00NCyU52fLZtIj8m8Ygs4' // Click 'View API Keys' above to copy your API secret
//     });
//
//     // Upload an image
//     const uploadResult = await cloudinary.uploader
//         .upload(
//             'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                 public_id: 'shoes',
//             }
//         )
//         .catch((error) => {
//             console.log(error);
//         });
//
//     console.log(uploadResult);
//
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
//
//     console.log(optimizeUrl);
//
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 512,
//         height: 512,
//     });
//
//     console.log(autoCropUrl);
// }
//
// upload();









import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dyo1wxvoc',
    api_key: '556374454877768',
    api_secret: 'gWH6RU00NCyU52fLZtIj8m8Ygs4'
});

// Set up multer storage to use Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Optional: folder name in Cloudinary
        format: async (req, file) => 'png', // Convert all images to PNG
        public_id: (req, file) => file.originalname.split('.')[0] // Use original name (without extension) as public ID
    }
});

// Initialize multer
const upload = multer({ storage });

const app = express();

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ message: 'File uploaded successfully', fileUrl: req.file.path });
});
