var Utilizador = module.exports
var Connection = require('./connection')

var axios = require ('axios')


Utilizador.getUtilizador = async function(idUtilizador){
    try{
        var informacao = await Utilizador.getUtilizadorAtomica(idUtilizador)
        var publicacoes = await Utilizador.getPublicacoesFromUtilizador(idUtilizador)
        var anos = await Utilizador.getAnosInscrito(idUtilizador)
        var amigos = await Utilizador.getAmigos(idUtilizador)

        var utilizador = {
            info: informacao[0],
            pubs: publicacoes,
            anosInscrito: anos,
            amigos: amigos
        }

        return utilizador
    }
    catch(e){
        throw e
    }
}


Utilizador.getUtilizadorAtomica = async function(idUtilizador){

    var iduser = idUtilizador.replace(/@/,"\\@");


    var query = `
    select ?numAluno ?numTelemovel ?nome ?sexo ?dataNasc ?curso where{
        c:${iduser} a c:Aluno .
        c:${iduser} c:numAluno ?numAluno .
        c:${iduser} c:numTelemovel ?numTelemovel .
        c:${iduser} c:nome ?nome .
        c:${iduser} c:sexo ?sexo .
        c:${iduser} c:dataNasc ?dataNasc .
        c:${iduser} c:frequenta ?idcurso .
        ?idcurso a c:Curso .
    	?idcurso c:nome ?curso .
    }
    `

    return Connection.makeQuery(query)
}


Utilizador.getPublicacoesFromUtilizador = async function(idUtilizador){

    var iduser = idUtilizador.replace(/@/,"\\@");

    var query = `
    select (STRAFTER(STR(?publicou), 'UMbook#') as ?idPublicacoes) where{
        c:${iduser} a c:Aluno .
        c:${iduser} c:publica ?publicou .
    }
    `

    return Connection.makeQuery(query)
}

Utilizador.getAnosInscrito = async function(idUtilizador){

    var iduser = idUtilizador.replace(/@/,"\\@");

    var query = `
    select (STRAFTER(STR(?anos), 'UMbook#') as ?idAnos) where{
        c:${iduser} a c:Aluno .
    	?anos a c:Ano .
        c:${iduser} c:frequenta ?anos .
    }
    `

    return Connection.makeQuery(query)

}

Utilizador.getAmigos = async function(idUtilizador){

    var iduser = idUtilizador.replace(/@/,"\\@");

    var query = `
    select (STRAFTER(STR(?amigos), 'UMbook#') as ?idAmigo) ?nome where{
        c:${iduser} c:éAmigoDe ?amigos .
        ?amigos c:nome ?nome .
    }
    `

    return Connection.makeQuery(query)
}

Utilizador.getEventos = async function(idUtilizador){
    var iduser = idUtilizador.replace(/@/,"\\@");
    var query = `
    select (STRAFTER(STR(?evento), 'UMbook#') as ?idEvento) where{
        ?evento a c:Evento . 
        ?evento c:temPresenca c:${iduser} .
    }
    `

    return Connection.makeQuery(query)
}

Utilizador.updateUtilizador = async function(idUtilizador, utilizador){
    var iduser = idUtilizador.replace(/@/,"\\@");
    var query = `
    delete{
        c:${iduser} c:numAluno ?numAluno .
        c:${iduser} c:numTelemovel ?numTelemovel .
        c:${iduser} c:nome ?nome .
        c:${iduser} c:sexo ?sexo .
        c:${iduser} c:dataNasc ?dataNasc .
    }
    Insert{
        c:${iduser} c:numAluno ${utilizador.numAluno} .
        c:${iduser} c:numTelemovel ${utilizador.numTelemovel} .
        c:${iduser} c:nome ${utilizador.nome} .
        c:${iduser} c:sexo ${utilizador.sexo} .
        c:${iduser} c:dataNasc ${utilizador.dataNasc} .
    }
    where{
        c:${iduser} c:numAluno ?numAluno .
        c:${iduser} c:numTelemovel ?numTelemovel .
        c:${iduser} c:nome ?nome .
        c:${iduser} c:sexo ?sexo .
        c:${iduser} c:dataNasc ?dataNasc .
    }
    `

    return Connection.makePost(query)
}

Utilizador.adicionarAmigo = async function(id1, id2){
    var iduser1 = id1.replace(/@/,"\\@");
    var iduser2 = id2.replace(/@/,"\\@");
    console.log(iduser1)
    console.log(iduser2)
    var query = `
    Insert Data {
        c:${iduser1} c:éAmigoDe c:${iduser2} .
    } 
    `

    return Connection.makePost(query)
}

Utilizador.adicionarEvento = async function(idUtilizador, idEvento){
    var iduser = idUtilizador.replace(/@/,"\\@");

    var query = `
    Insert Data {
        c:${idEvento} c:temPresenca c:${iduser}.
    } 
    `

    return Connection.makePost(query)
}

Utilizador.removerAmigo = async function(id1, id2){
    var iduser1 = id1.replace(/@/,"\\@");
    var iduser2 = id2.replace(/@/,"\\@");

    var query = `
    Insert Data {
        c:${iduser1} c:éAmigoDe "${iduser2}" .
    } 
    `

    return Connection.makePost(query)
}


Utilizador.insertUtilizador = async function(utilizador){
    var iduser = utilizador.id.replace(/@/,"\\@");
    var query = `
    Insert Data {
        c:${iduser} a owl:NamedIndividual ,
                        c:Utilizador .
        c:${iduser} c:numAluno "${utilizador.numeroAluno}" .
        c:${iduser} c:numTelemovel "${utilizador.numeroTelemovel}" .
        c:${iduser} c:nome "${utilizador.nome}" .
        c:${iduser} c:sexo "${utilizador.sexo}" .
        c:${iduser} c:dataNasc "${utilizador.dataNascimento}" .
        c:${iduser} c:frequenta c:${utilizador.idCurso} .
        c:${iduser} c:frequenta c:${utilizador.idAno} . 
    }
    `

    await Connection.makePost(query)
    return { "id" : iduser}
}