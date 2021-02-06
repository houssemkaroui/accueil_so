const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');


const AdminSchema = mongoose.Schema({


    nom:{
        type:String,
      //  require:true
    },
   
    
    email: {
        type: String,
        unique: true,
       // required: true 
    },
    password: {
        type: String,
        unique: true,
        //required: true 

    },
    confirmation: {
        type: Number,
        default: 0
         
    }
  
});




AdminSchema.plugin(uniqueValidator);

const Admin = module.exports = mongoose.model('Admin', AdminSchema);
//validation email
AdminSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');






// Créer compte Admin

module.exports.addAdmin = function(newAdmin,callback){
    bcrypt.genSalt(10, (err, salt) => {
        

        bcrypt.hash(newAdmin.password , salt,(err,hash)=>{
            if(err) throw (err);
            newAdmin.password = hash;
            newAdmin.save(callback);
        });
    });
}
// Comparer les mots de passe
module.exports.comparePassword = function (password, hash, callback) {
    bcrypt.compare(password, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}