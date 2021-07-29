const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const regschema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    age:{
        type:Number,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})
//as any other iddleware wilwe will register it by the schema 
// use mthods() for instance created 
regschema.methods.generate = async function(){
    //to use this keyword normal function we will create try cath here again
    try{
        const token = jwt.sign({_id:this.id.toString()},process.env.SECRET_KEY); //gere we wiol storethne value for this.id matching and compulsory nede to cnvert it to Sting
        console.log(token);//firstit ill trow er for toString() but only use 
        return token;//to not undefined on that page console
        //no wgain to add tokens in database also we will add a  new files tokens [{}] at the end arr of object
        //now by this.tokens we get tokens and concat the arr with our new token to add new tokenwith conct method
        this.tokens = this.tokens.concat({token:token});//and now set he value of it with our genereted token as token filed
        await this.save();//to last save it on the database
        // but now it's an objectit with it then we need to convert it with strong
        //but now cpassword is required we willcreate hash cpasswor also
    } catch(e){
        console.log(e);
        res.send(e);
}
}
//donwe now we are genretiong tokens at register tiome we wsilld o it login time also now
//basically we just nned to call the sanme generate function at login time always login tim

// here we will use on schema pre methdo beore save methdo where we will has h the passowrd and then do next things but remember this keywo
regschema.pre('save',async function(next){
    if(this.isModified('password')){
    //always remember this function willmsut have the next as a paramaeter which as function we willca ll at end to continute saveing the save metghod
    this.password  = await bcrypt.hash(this.password,10);//and to define the password at that field by used we will us ethis keywrd
    // console.log(passwordhash);
    this.cpassword = await bcrypt.hash(this.cpassword,10);
    //and yeah also one maiting is that we needd to hash passowrd when on only when thepassowrd is modifeid inot on ahnything ele modifyed alriht if done then it twice hashed and not  macth again ever
    }
    next();//if not called next then reload will run always
})
//creating models for schema
const regnow = new mongoose.model("empreg",regschema);

module.exports = regnow;