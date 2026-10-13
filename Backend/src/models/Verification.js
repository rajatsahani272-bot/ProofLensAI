import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    originalFilename: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing"
    },
    report: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    error: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;