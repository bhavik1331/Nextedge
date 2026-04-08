import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: function() {
        return this.email ? this.email.split('@')[0] : 'Unknown';
      }
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      default: "MEMBER",
      enum: ["ADMIN", "CLUB_HEAD", "TREASURER", "MEMBER"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    avatar: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

memberSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

memberSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

memberSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Member = mongoose.model("Member", memberSchema);
export default Member;
