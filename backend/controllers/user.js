
const con=require("../config_db/db_connect");  
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sha256 = require('sha256');
const validator = require("email-validator");

//const jwtCtrl=require("../middleware/auth");
const JWT_SECRET="MY_TOKEN_IS_SECRET";
exports.AllUsers=(req,res,next)=>{
    let sql="SELECT * FROM user";
    con.query(sql,(err,result)=>{
      if(err) throw err;
      console.log(result);
      res.send(result);
    })
  }
  
exports.OneUser=(req,res,next)=>{
    let sql="SELECT * FROM user WHERE id=?";
    let insert=[req.params.id];
    con.query(sql,insert,(err,result)=>{
      if(err) throw err;
      console.log(result);
      res.send(result);
    })
  }
  

exports.signup=(req,res,next)=>{
  let verifiPassword= new RegExp("^([a-z0-9]{2,})$");
  if(validator.validate(req.body.email)===true && verifiPassword.test(req.body.password)===true){
    let psdCrypt=req.body.password;
    bcrypt.hash(psdCrypt, 10, function(err,psdCrypt) {
      let sql= "INSERT INTO user VALUES (NULL,?,?,?,?,?,2)";
      let email=sha256.x2(req.body.email);
      let insert=[req.body.nom, req.body.prenom, email, psdCrypt, req.body.poste];
      con.query(sql,insert,(err,result)=>{
        if(err) {res.status(400).json({ message: 'Utilisateur existant' })}
        else{  res.status(200).json({ message: 'Utilisateur ajouté' });}
        })
      });
    }
    else{
      res.status(400).json({ message: 'Données incorrect' })
    }
  }
  
  
exports.login=(req,res,next)=>{
  
    let sql= "SELECT email,id,password from user where email = ?";
    let insert=[sha256.x2(req.body.email)];
    con.query(sql,insert,(err,result)=>{
      
      if(err)  res.status(400).json({ message: 'faux'});
     console.log(result[0]);
      if(result[0]==undefined){ res.status(400).json({ message: 'Aucun utilisateurs confirmé' }); }
      else{dataId=result[0].id;
        
      bcrypt.compare(req.body.password, result[0].password, function(err, result) {
        if(result){res.status(200).json({ userId: dataId,
          token: jwt.sign(
            {userId: dataId },
            JWT_SECRET,
            { expiresIn: "24h" }
          )
        })}
        else { res.status(400).json({ message: 'Aucuns utilisateurs ne correspond'})}
        });
      
      }
      
     
    })
 
  }