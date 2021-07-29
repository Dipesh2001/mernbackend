require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const regnow = require('../src/models/register');
// const jsonParser = bodyParser.json();
// const urlencodedParser = bodyParser.urlencoded({extended:false});
const port = process.env.PORT || 3000;
require('../src/db/conn');

// const staticpath = path.join(__dirname,'../public');
const partialpath = path.join(__dirname,'../templates/partials');
const viewspath =  path.join(__dirname,'../templates/views');
const csspath = path.join(__dirname,'../public');
app.use('/mypath', express.static(csspath));
app.set('view engine','hbs');
app.set('views',viewspath);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
// app.use(express.static(staticpath));
hbs.registerPartials(partialpath);
// app.get('/',(req,res)=>{
// 	res.send('hello from theother side');
// })
// app.use(csspath);
console.log(process.env.SECRET_KEY);
app.get('/',(req,res)=>{
	res.render('index');
})

app.post('/register',async(req,res)=>{
try{
	const addit  = new regnow({
		name:req.body.uname,
		phone:req.body.phone,
		email:req.body.email,
		age:req.body.age,
		password:req.body.password,
		cpassword:req.body.cpassword
	});
	//now here before saving it on db and after got data from user will hash the password a then store it will be eused ad s middleware
	//here is now the concepyt o middle ware 
	//to define a middleware onpre ro post iof the after defining te cheema and we will use pre method on schema 
	
	//now we will genearate and verify the token at regisration time 
	//now in adavacne w ewil see the middleware w will generate the token with middleware 
	// and verify it later at loguni time  lets make wa function to generate the token
	const token = await addit.generate();//we will generate the function after the chema define 
	// /remmeber we have to define the function with .methods if iinstance is used if direct collection name used then .statics() method will work
	//define the function with schema.

	//here we will do soem ging to save theat generated token on the cookie 
	// usee res.cookie() ere to save to cookie on client side
	res.cookie("jwt",token);
	console.log(cookie);
	if(req.body.password === req.body.cpassword){
		const now = await addit.save();
		console.log(now);
		// res.status(201).send(now);
		res.render('index');
	}else{
		res.send("passwords are not matching");
	}
}catch(err){
	console.log(`the is an error${err} `);
	res.send(err);
}
})

app.post('/login',async(req,res)=>{
	try{
		const nowmail = req.body.email;
		const nowpass = req.body.password;
		//now we wre in login we willcompare the hashed [password with login eneterd passowrd by suer ]

		const againnow = await regnow.findOne({email:nowmail});
		// console.log(againnow);
		// console.log(againnow.password);
		const isMatch =await bcrypt.compare(nowpass,againnow.password);//wehe we ue method to compare firt now enterd 2nd is on database 
		//now just nned to do paste token generate function here
		const token = await againnow.generate();//but we will use gainnow as instance now
		console.log(`the token part${token}`);//alright ioots making the sma etoken creation at login time also
		if(isMatch){
			// res.send("logged in");
			res.render("index");
		}else{
			res.send("invalid details");
		}
	}catch(err){
		console.log(err);
		res.status(400).send(err);
	}
})

// now after registration and login the nwxt topic hsing 
// so first we need to unded stand deifference between hashing and encrypation

//so we have sen ou databse then we storing the psword in plain tet butnowwe will make it more4 secure 

//lets see the deifernce 
// encryption: i's a two way cmmunication
// means where we can encode our passowrd intosome hexacode and encoded but drawback is that 
// because it's two way afetr encoedding we can again decode it easily byusing that algorithem easily
// ex:dipesh -> hdshdskc ->dipesh

//but hashing:it's a one way communication
// means we can hash the passowrd once then we can never ever decode it back it will ppermannetly stored on thatform
//that swhy we use hashing alorithem to do all things
// ex:dipesh -> sudjdhnujnc //but we can not re decode it from encoded form toactal form

//there are many6 algoritghems in market already but 
//welike mdp,sha-1 ,sha-256 and manuy modere but we will use bcrypt with 12 rounds means 3 years minimum needeed

//now after all ttheory we actully hash passowrd and look at bcrypt and it's methods
// const securepass = async(pass)=>{
// 	//now para also we have we will see some methods first is hash() and hashSync()
// 	// but we will do use async no problem firrst para is user's writen pass and 2ns is the salt value 
// 	// number means how much round we will writbe to make password more secrd
// 	const hased = await bcrypt.hash(pass,10);//don't use much rounds it will slow loading
// 	//and yes remember all methods of bcrypt hjs are done asyncly then use await allt he time
// 	console.log(hased);

// 	//now if once we hasehd rthe pasword we can;t get it back then we hasve also a method bcrypt.compare()
// 	// again it's firt [para is user's entered pasw at login time and 2nd para is our hased passord and methndo its hashed form always
// 	const matched = await bcrypt.compare("dipesh123",hased);
// 	console.log(matched);
// }

// securepass("dipesh123");//suppose this isa function to secure our passowrd

// 3.now we will secure th ethe registrationpassword 
// we have already requirwde it ww will use it bcarypt as a middleware

// /now after registration time hashing passowrd done now we willsee login time compare the passowrd now again we wee do some things in passowrd

//now agai nafer allthis thing we wiosee about jwt n=mans jsonweb token toauthenicate users each time visits on any page
// def:JSon webtokenis a standard used to createaceess token for n application
// it works this way: server generates a token that certifies the user identity , and send sto the cliendt

//suppose on amaxzson we ahve done add to car again we visit it not ask for login also remembersed the cookies that ahs daat what is incart we awilo see it again
// cookies also has crete ,expires tkme,session,name and anything //so we will do the authenicationon use using jwt
//wqe will check gennuine user created with secret by server wherew browser seestoken at client side and remember it's data
// what to sh9ow it secert is at server side but toek has cookies onthe cliendt side

// /lets startconst 
const jwt = require('jsonwebtoken');
//create a function to create token each time
const createtoken=async()=>{
	//first step we willcreate a signature , and pass payload wihich combine with secret key provided by server
	//that how we can do the identified th registed use at sign up time by that token we can  getbohistory

	//sign methd ofirt para with{} take _id:ujsskdjhn and , 2nd para will be secret key for generateunique toke for it
	const token=await jwt.sign({_id:"someid here"},"mynameisdeipeshkhedkaragainandagain");
	// console.log(token);
	//again to verify the koken w have jwt has me4thod .verify() method token as first para and 2nd ifsthe secretkey generated on the server side
	//best part is that we can vexpire he time of token generate d we can add also at sign metho dinm end as arg expiresIn:'2minutes'

}
//14. manage secrets and configs using the .dotenv package 
// now e will crate some secret page to acces only the token verifieed authorized user only
//in our case we are showing our secret key very easily we have to make it secure at hosting of push time
// we will install packeage .dotenv 
//in this package we can use the process.env made some special variables now
// to use .dotenv we have to require the dotenv.config() method now
// and after this jus crate a .env file in our root directory of project 
//we can use the process.env.SECRET_KEY and try consolingi t

//but now no problem anyone can easily watc it in .env file also 
// then we will use .gitignore file we will include it then no one can see our secret key by our code

//now at last we will authenicate the user properly now we will use cookies for saving 
// the secrectt key on server side but the token to the client side in our browser to keep the trak ofuse rand it's data
// def:cookirs are samll files which stored on a users computer , thety are designerd to hold a modest
// amount of data specifinc and perticauler lient and wbsite ,a nd can be accessed either by the web server on client's computer

// we will do all the thing  by te res.cookie() method after generating the token at the 
// server siteafetr generated and before saving on db

// the res.cookie() function is used toset the cookie name to value as first and 2ndpara
// the value para may be string or object converted to json
// syntax: res.cookie(name.value,[options]);
createtoken();
app.get('/register',(req,res)=>{
	res.render('register');
})

app.get('/login',(req,res)=>{
	res.render('login');
})

app.listen(port,()=>{
	console.log(`server has started on ${port}.`);
})