const mongoose=require("mongoose");
const jobSchema=new mongoose.Schema(
  {
    title:{
      type:String,
      required:true,
      trim:true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },

    budget: {
      type: Number,
      required: true,
      min: 0
    },

    skills: {
      type: [String],
      default: []
    },

    deadline: {
      type: Date,
      required: true
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
     status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'closed'],
      default: 'open'
    }
  },
  {
    timestamps:true
  }
);

const Job=mongoose.model("Job",jobSchema);

module.exports=Job;