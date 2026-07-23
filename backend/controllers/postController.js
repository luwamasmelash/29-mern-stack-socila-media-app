import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";


// Add Post
export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth();

        const { content, post_type } = req.body;

        const images = req.files || [];

        let image_urls = [];


        console.log("Files received:", images);


        if (images.length > 0) {

            image_urls = await Promise.all(
                images.map(async (image) => {

                    console.log("Uploading:", image.originalname);


                    const fileBuffer = fs.readFileSync(image.path);


                    const response = await imagekit.files.upload({
                        file: fileBuffer.toString("base64"),
                        fileName: image.originalname,
                        folder: "posts",
                    });


                    console.log("Image uploaded:", response.url);


                    return response.url;

                })
            );

        }


        const post = await Post.create({
            user: userId,
            content,
            image_urls,
            post_type,
        });


        res.json({
            success: true,
            message: "Post created successfully",
            post,
        });


    } catch (error) {

        console.log("ADD POST ERROR:", error);


        res.json({
            success: false,
            message: error.message,
        });
    }
};



// Get Feed Posts
export const getFeedPosts = async (req, res) => {

    try {

        const { userId } = req.auth();


        const user = await User.findById(userId);


        const userIds = [
            userId,
            ...user.connections,
            ...user.following,
        ];


        const posts = await Post.find({
            user: {
                $in: userIds,
            },
        })
        .populate("user")
        .sort({
            createdAt: -1,
        });


        res.json({
            success: true,
            posts,
        });


    } catch (error) {

        console.log(error);


        res.json({
            success: false,
            message: error.message,
        });

    }
};



// Like Post
export const likePost = async (req, res) => {

    try {

        const { userId } = req.auth();

        const { postId } = req.body;


        const post = await Post.findById(postId);


        if (!post) {

            return res.json({
                success: false,
                message: "Post not found",
            });

        }


        if (post.likes_count.includes(userId)) {


            post.likes_count = post.likes_count.filter(
                id => id !== userId
            );


            await post.save();


            return res.json({
                success: true,
                message: "Post unliked",
            });

        }


        post.likes_count.push(userId);


        await post.save();


        res.json({
            success: true,
            message: "Post liked",
        });


    } catch (error) {


        console.log(error);


        res.json({
            success: false,
            message: error.message,
        });

    }
};

// Get User Profiles
export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await User.findById(profileId)
        if(!profile){
            return res.json({ success: false, message: "Profile not found" });
        }
        const posts = await Post.find({user: profileId}).populate('user')

        res.json({success: true, profile, posts})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}