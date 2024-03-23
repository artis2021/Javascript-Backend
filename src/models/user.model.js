import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    
    

}, {timestamps: true})

export const User = mongoose.model("User", userSchema)