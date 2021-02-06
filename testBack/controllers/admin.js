const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../Models/Admin');
const config = require('../config/db');
const session = require('express-session');
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
// pour le register dun admin
router.post('/register', (req, res) => {
    var newAdmin = new Admin({
        nom:req.body.nom,
        email:req.body.email,
        password: req.body.password
        //confirmation: 0
    });

    Admin.addAdmin(newAdmin, (err, user) => {
        
        if (err) {
            let message = "";
            //if (err.errors.password) message = "password est déja utilisé. ";
            if (err.errors.email) message = "Adresse mail est déja utilisée.";
            return res.json({
                success: false,
                message
            });
        } else {

          var email = req.body.email;
          var tokenForConfirmation = jwt.sign({email: email}, 'confirmation')
        
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: "your email",
            pass: "your password"
            }
            });
            var mailOptions = {
            from: 'your email',
            to:    email,
            subject: 'Confirmation de votre compte',
            html: `
            <p>Merci de votre inscription.</p>
            <br/>
             <p> Pour confirmer votre compte sur notre platforme 
              <a href="http://localhost:3000/api/admin/confirmation/${tokenForConfirmation}"> Cliquer ici </a> </p>
            `
            };
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                 res.json({message: "Error to create your account",})
              } else {
                res.json({message: "ok",})
              }
         });
        }
    });
});




//confirmation de login redirection ver la page login
router.get('/confirmation/:token', (req, res) => {
  var token = req.params.token;

  var decoded = jwt.verify(token, 'confirmation')
  var email = decoded.email
  Admin.findOne({email}).then((admin) =>{
    if(admin && admin.confirmation == 0){
      admin.confirmation = 1;
      if( admin.save()) {
       res.redirect('http://localhost:4200/#/login');
      }

    }
  })
  
})

//pour l'authentification
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // console.log(sess);

    Admin.getAdminByEmail(email, (err, admin) => {
        if (err) throw err;
        if (!admin) {
            return res.json({
                success: false,
                message: "Admin non trouvé."
            }); 
        }
 
        Admin.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              if(admin.confirmation == 1){
                const token = jwt.sign({
                  type: "admins",
                  data: {
                      _id: admin._id,
                      password:admin.password,
                      email: admin.email ,
                  }
              }, config.secret, {
                  expiresIn: 604800 // le token expisre 
              });

              return res.status(200).json({
                  success: true,
              
                  token: "JWT " + token
              });
              }else{
                return res.json({
                  success: false,
                  message: "Merci de comfirmer votre compte pour connecter."
              });
              }
            } else {
                return res.json({
                    success: false,
                  
                    message: "Mot de passe ou email est invalid"
                });
            }
        });
    });
});











module.exports = router;