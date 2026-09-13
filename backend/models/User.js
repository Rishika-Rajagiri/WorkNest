const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({

  name:{
    type:String,
    required:true,
    trim:true
  },

  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true
  },

  password:{
    type:String,
    required:true
  },

  role:{
    type:String,
    enum:["client","freelancer"],
    required:true
  },
  skills:{
    type:[String],
    default:[]
  },
  bio:{
    type:String,
    default:""
  },
  emailVerified:{
    type:Boolean,
    default:false
  },
  emailVerificationOTP: {
    type: String,
    default: null
  },

  emailVerificationOTPExpires: {
  type: Date,
  default: null
  },
  otpLastSentAt: {
    type: Date,
    default: null
  } 
},
  {
  timestamps:true
  
});


const User=mongoose.model("User",userSchema);
module.exports=User;