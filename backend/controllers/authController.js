const User=require('../models/User')
const bcrypt=require('bcryptjs')
const registerUser=async (req,res)=>{
  try{
    const {name,email,password,role,skills,bio}=req.body;

    //check required fields
    if(!name || !email || !password || !role){
      return res.status(400).json({message:"Please fill in all required fields"});
    }
  

  //check if user already exists

  const existingUser=await User.findOne({email});

  if(existingUser){
    return res.status(400).json({message:"User already exists"});
  };

  //hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  //create user
  const user=await User.create({
    name,
    email,
    password:hashedPassword,
    role,
    skills:skills || [],
    bio:bio || ""
  })

  res.status(201).json({
    message:"User registered successfully",
    user:{
      id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                skills: user.skills,
                bio: user.bio
    }
  })
}catch(error){
    console.error("Error registering user:", error);
    res.status(500).json({message:"Server error"});
}
};

module.exports={registerUser}
