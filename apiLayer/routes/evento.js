// --------------------------------------- Evento -----------------------------------------
var express = require('express');
var router = express.Router();

var host = require('../config/config').host
var apiEventos = host+"eventos/"
var axios = require('axios')
var passport = require('passport')

// ---------- ROTA   : /api/eventos ....

// ------------------------------------------------------ GET --------------------------------------------

router.get('/', passport.authenticate('jwt', {session: false}), function(req, res){
    axios.get(apiEventos)
    .then(dados => res.jsonp(dados.data))
    .catch(erro => {console.log(erro); res.status(500).jsonp(erro) })
})



router.get('/:idEvento', passport.authenticate('jwt', {session: false}), function(req, res){
    axios.get(apiEventos + req.params.idEvento)
    .then(dados => res.jsonp(dados.data))
    .catch(erro => {console.log(erro); res.status(500).jsonp(erro) })
})

router.get('/parceria/:idParceria', passport.authenticate('jwt', {session: false}), function(req, res){
    axios.get(apiEventos + "parceria/" + req.params.idParceria)
    .then(dados => res.jsonp(dados.data) )
    .catch(erro => {console.log(erro); res.status(500).jsonp(erro) })
})

router.get('/participante/:idParticipante', passport.authenticate('jwt', {session: false}), function(req, res){
    axios.get(apiEventos + "participante/" + req.params.idParticipante)
    .then(dados => res.jsonp(dados.data))
    .catch(erro => {console.log(erro); res.status(500).jsonp(erro) })
})

// ------------------------------------------------------ POST --------------------------------------------

router.post('/', passport.authenticate('jwt', {session: false}), function(req, res){
    axios.post(apiEventos, req.body)
    .then(dados => res.jsonp(dados.data))
    .catch(erro => {console.log(erro); res.status(500).jsonp(erro) })
})

module.exports = router;