import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";

const registerUser = asyncHandler(async(req, res) => {
    // res.status(200).json({
    //     "message": "javascript backend"
    // })
    

    //get user details from frontend
    const {fullName, email, username, password} = req.body
    console.log("email", email)

    //validation
    if(fullName === ""){
        throw new ApiError(400, "Fullname is required")
    }  
    if(email === ""){
        throw new ApiError(400, "Email is required")
    } 
    if(username === ""){
        throw new ApiError(400, "username is required")
    } 
    if(password === ""){
        throw new ApiError(400, "Password is required")
    } 

    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser) throw new ApiError(409, "User with email or username already exists")

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) throw new ApiError(400, "Avatar file is required")

    //upload avatar and coverpage on cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) throw new ApiError(400, "Avatar file is require")

    //entry in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //remove password
    if(!createdUser) throw new ApiError(500, "Something went wrong while registering the user details" )

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})

export {registerUser}