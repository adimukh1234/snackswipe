const Imagekit = require("imagekit");

const imagekit = new Imagekit({
    publicKey : process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey : process.env.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGE_KIT_URL_ENDPOINT
});


async function uploadFile(file, fileName) {
    const result = await imagekit.upload({
        file: file,
        fileName: fileName,
    });
    return result;
}

module.exports = { uploadFile };