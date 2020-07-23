var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var nanoid = require('nanoid')
var axios = require('axios')
var Tokens = require('../controllers/refreshToken')


var config = require('../config/config')
var apiDadosHost = config.apiDadosHost
const jwtKey = "LEI-UMbook"
const jwtExpirySeconds = 10 * 60

generateToken = function(user){

    const token = jwt.sign({ user }, jwtKey, {
		algorithm: "HS256",
		expiresIn: jwtExpirySeconds,
    })
    
    return token
}

router.post('/login', function(req, res){
  axios.post(apiDadosHost + "utilizadores/login", req.body)
            .then(async dados => { 
              
              var response = dados.data
              if(response.authentication == true){
                response.token = await generateToken(response.utilizador)
                var tokenExistente = await Tokens.findUserTokenAtivo(response.utilizador.idUtilizador)
                if(tokenExistente == null){
                  var token = nanoid.nanoid();
                  var refeshToken = {token:token, idUtilizador: response.utilizador.idUtilizador, estado: "Ativo"}
                  Tokens.createToken(refeshToken)
                  res.cookie('refresh-token', refeshToken, { httpOnly: true, sameSite: 'strict'});
                }
                else{
                  res.cookie('refresh-token', tokenExistente, { httpOnly: true, sameSite: 'strict'});
                }
              }
              res.jsonp(response)
            })
            .catch(erro => {console.log(erro); res.status(500).jsonp(erro) })

})


router.post('/refreshToken',  function(req, res){
    var cookie = req.cookies['refresh-token']
    Tokens.findUserTokenAtivo(cookie.idUtilizador)
    .then(async token =>{
      if(token == null)
      res.sendStatus(401);
      else{
        var newToken = await generateToken(req.body)
        res.jsonp({token: newToken})
      }
    })
    .catch(erro => res.status(500).jsonp(erro))

})

module.exports = router;
