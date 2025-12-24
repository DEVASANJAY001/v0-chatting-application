import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: new Date(),
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model("User", userSchema)
