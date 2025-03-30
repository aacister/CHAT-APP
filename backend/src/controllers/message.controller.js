import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";


export const getUsersForSidebar = async (req, res) => {
    try{
        const loggedinUserId = req.user._id;
        const filteredUsers = User.find({_id : {$ne: loggedinUserId}}).select("-password");  //select everything but password

        res.status(200).json(filteredusers);
    }
    catch(err){
        console.log("Error in getUserforSidebar endpoint", err);
        res.status(500).json({message: 'Internal Server Error.'});
    }
};

export const getMessages = async (req, res) => {
    try{
        const {id:userToChatId}  = req.params;
        const myId = req.user._id;
        const messages = Message.find(
            {
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        });
        res.status(200).json(messages);
    }
    catch(err){
        console.log("Error in getMessages controller", err);
        res.status(500).json({message: 'Internal Server Error.'});
    }
};

export const sendMessage = async (req, res) => {
    try{
        const {text, image} = req.body;
        const {id:receiverId } = req.params; //renaming id variable to receiverId after deconstruction
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            //updoad base64 image to cloudenary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // todo: realtime chat functionality goes here ==> socket.io

        res.status(201).json(newMessage);
    }
    catch(err){
        console.log("Error in sendMessage controller", err);
        res.status(500).json({message: 'Internal Server Error.'});
    }
}