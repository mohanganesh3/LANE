/**
 * Cloudinary Configuration
 * For cloud-based image and document storage
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for different file types
const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'pdf']) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folder,
            allowed_formats: allowedFormats,
            transformation: [{ quality: 'auto' }],
            resource_type: 'auto'
        }
    });
};

// Storage configurations for different document types
const storageConfigs = {
    // Profile images
    profileImages: createCloudinaryStorage('lane-carpool/profiles', ['jpg', 'jpeg', 'png']),
    
    // Driver documents
    driverLicense: createCloudinaryStorage('lane-carpool/documents/driver-license', ['jpg', 'jpeg', 'png', 'pdf']),
    governmentId: createCloudinaryStorage('lane-carpool/documents/government-id', ['jpg', 'jpeg', 'png', 'pdf']),
    
    // Vehicle documents
    vehicleRC: createCloudinaryStorage('lane-carpool/documents/vehicle-rc', ['jpg', 'jpeg', 'png', 'pdf']),
    insurance: createCloudinaryStorage('lane-carpool/documents/insurance', ['jpg', 'jpeg', 'png', 'pdf']),
    vehiclePhotos: createCloudinaryStorage('lane-carpool/vehicles', ['jpg', 'jpeg', 'png']),
    
    // General documents
    documents: createCloudinaryStorage('lane-carpool/documents', ['jpg', 'jpeg', 'png', 'pdf'])
};

module.exports = {
    cloudinary,
    storageConfigs,
    createCloudinaryStorage
};
