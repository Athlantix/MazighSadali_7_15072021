
const con=require("../config_db/db_connect");  
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sha256 = require('sha256');
const validator = require("email-validator");
require('dotenv').config();
//const jwtCtrl=require("../middleware/auth");
//const JWT_SECRET="MY_TOKEN_IS_SECRET";
exports.AllUsers=(req,res,next)=>{
    const sql="SELECT * FROM user";
    con.query(sql,(err,result)=>{
      if(err) throw err;
      console.log(result);
      res.send(result);
    })
  }
  
exports.OneUser=(req,res,next)=>{
    const sql="SELECT * FROM user WHERE id=?";
    const insert=[req.params.id];
    con.query(sql,insert,(err,result)=>{
      if(err) throw err;
      console.log(result);
      res.send(result);
    })
  }

  exports.DeleteUser=(req,res,next)=>{
    const sql="DELETE FROM user WHERE id=?;";
    const insert=[req.params.id];
    con.query(sql,insert,(err,result)=>{
      if(err) {res.status(400).json({ message: 'Nous ne parvenons pas à supprimer un utilisateur ' })}
      else{  res.status(200).json( result)}
    })
  }
  

exports.signup=(req,res,next)=>{
  const verifiPassword= new RegExp("^([a-zA-Z0-9]{5,})$");
  if(validator.validate(req.body.email)===true && verifiPassword.test(req.body.password)===true){
    const psdCrypt=req.body.password;
    bcrypt.hash(psdCrypt, 10, function(err,psdCrypt) {
      const sql= "INSERT INTO user VALUES (NULL,?,?,?,?,?,2)";
      const email=sha256.x2(req.body.email);
      const insert=[req.body.nom, req.body.prenom, email, psdCrypt, req.body.poste];
      con.query(sql,insert,(err,result)=>{
        if(err) {res.status(400).json({ message: 'Utilisateur existant' })}
        else{  res.status(201).json({ message: 'Utilisateur ajouté' });}
        })
      });
    }
    else{
      res.status(400).json({ message: 'Données incorrect' })
    }
  }
  
  
exports.login=(req,res,next)=>{
  
    const sql= "SELECT id,nom,prenom,poste,email,password,acces from user where email = ?";
    const insert=[sha256.x2(req.body.email)];

    
   
    con.query(sql,insert,(err,result)=>{
      
      if(err)  res.status(400).json({ message: 'faux'});
     console.log(result[0]);
      if(result[0]==undefined){ res.status(400).json({ message: 'Aucun utilisateurs confirmé' }); }
      else{
       const dataId=result[0].id;
       const dataAcces=result[0].acces; 
       const dataNom=result[0].nom;
       const dataPrenom=result[0].prenom;
       const dataPoste=result[0].poste;
   
      bcrypt.compare(req.body.password, result[0].password, function(err, result) {
     
        if(result){res.status(200).json({ userId: dataId,acces: dataAcces,prenom: dataPrenom,nom: dataNom,poste: dataPoste,
          token: jwt.sign(
            {userId: dataId },
            process.env.JWT_SECRET,
            { expiresIn:process.env.JWT_EXPIR }
          )
        })}
        else { res.status(400).json({ message: 'Aucuns utilisateurs ne correspond'})}
        });
      
      }
      
     
    })
 
  }

  exports.getCurrentUser=(req,res,next)=>{
    console.log("ok");
    const token = req.headers.authorization.split(' ')[1];
    console.log(token)
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    console.log("le user id: "+ userId);

    const sql="SELECT * FROM user WHERE id=?;";
    const insert=[userId];
    con.query(sql,insert,(err,result)=>{
      if(err)  res.status(400).json({ message: 'faux'}) 
      else{
        const userAcces=result[0].acces;
        const dataNom=result[0].nom;
        const dataPrenom=result[0].prenom;
        const dataPoste=result[0].poste;
        
        res.status(200).json({userId:userId,userAcces,dataNom,dataPrenom,dataPoste}) }

    })
  }
  
  exports.ModifyUser=(req,res,next)=>{
    const sql=
"UPDATE user SET nom= ? , prenom= ? ,poste=? where id= ?;";
const insert=[req.body.nom, req.body.prenom, req.body.poste, req.body.id]
    con.query(sql,insert,(err,result)=>{
      if(err) {res.status(400).json({ message: 'Nous ne parvenons pas à modifier un utilisateur ' })}
      else{  res.status(200).json( result)}
    })
  }