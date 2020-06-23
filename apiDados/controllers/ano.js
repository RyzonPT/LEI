var Ano = module.exports
var Connection = require('./connection')
var Publicacao = require('./publicacao')
var axios = require('axios')

Ano.getAno = async function(idAno){
    try{
        var info = await Ano.getAnoAtomica(idAno)
        var responsaveis = await Ano.getResponsaveisFromAno(idAno)
        var estudantes = await Ano.getEstudantesFromAno(idAno)
        var cadeiras = await Ano.getCadeirasFromAno(idAno)
        var publicacoes = await Ano.getPublicacoesFromAno(idAno)

        var ano = {
            info : info[0],
            responsaveis : responsaveis,
            estudantes : estudantes,
            cadeiras : cadeiras,
            publicacoes : publicacoes
        }
        
        return ano
    }
    catch(e){
        throw e
    }
}



Ano.getAnoAtomica = async function(idAno){
    var query = `
    select ?nome ?curso ?anoLetivo (STRAFTER(STR(?curso), 'UMbook#') as ?idCurso) where{
        c:${idAno} c:nome ?nome . 
        c:${idAno} c:anoLetivo ?anoLetivo .
        c:${idAno} c:fazParteCurso ?curso .
    }
    `

    return Connection.makeQuery(query)
}


Ano.getEstudantesFromAno = async function(idAno){
    var query = `
    select (STRAFTER(STR(?estudante), 'UMbook#') as ?id) ?dataNascimento ?nome ?numeroAluno ?numeroTelemovel ?sexo where{
        ?estudante c:frequenta c:${idAno} .
        ?estudante c:dataNasc ?dataNascimento . 
        ?estudante c:nome ?nome .
        ?estudante c:numAluno ?numeroAluno .
        ?estudante c:numTelemovel ?numeroTelemovel .
        ?estudante c:sexo ?sexo . 
    }
    `

    return Connection.makeQuery(query)
}

Ano.getCadeirasFromAno = async function(idAno){
    var query = `
    select (STRAFTER(STR(?cadeira), 'UMbook#') as ?id) ?designacao where{
        c:${idAno} a c:Ano .
        c:${idAno} c:leciona ?cadeira .
        ?cadeira c:nome ?designacao .
    }
    `

    return Connection.makeQuery(query)
}

Ano.getPublicacoesFromAno = async function(idAno){
    
    var query = `
    select (STRAFTER(STR(?pub), 'UMbook#') as ?idPub) where{
        ?pub c:éPublicadaEm c:${idAno} .
    }
    `

    var idsPublicacoes = await Connection.makeQuery(query)
    
    var publicacoes = []

    for(let i = 0; i < idsPublicacoes.length ; i++ ){
        pub = await Publicacao.getPublicacao(idsPublicacoes[i].idPub)
        var publicacao = {
            idPublicacao : idsPublicacoes[i].idPub,
            dados : pub
        }
        publicacoes.push(publicacao)
    }

    return publicacoes

}

Ano.getResponsaveisFromAno = async function(idAno){

    var query = `
    select (STRAFTER(STR(?resp), 'UMbook#') as ?idResp) ?dataNascimento ?nome ?numeroAluno ?numeroTelemovel ?sexo
        where{
            ?resp c:gere c:${idAno} .
            ?resp c:dataNasc ?dataNascimento . 
            ?resp c:nome ?nome .
            ?resp c:numAluno ?numeroAluno .
            ?resp c:numTelemovel ?numeroTelemovel .
            ?resp c:sexo ?sexo . 
        }
    `

    return Connection.makeQuery(query)
}

Ano.addResponsavelToAno = async function(idAno, idResponsavel){

    var query = `
    insert data {
            c:${idResponsavel} c:gere c:${idAno} .
    }
    `

    return Connection.makePost(query)
}


Ano.addEstudanteToAno = async function(idAno, idEstudante){

    var query = `
    insert data {
            c:${idEstudante} c:frequenta c:${idAno} .
    }
    `

    return Connection.makePost(query)
}


Ano.addCadeira = async function(idAno, idCadeira){
    var query = `
    insert data {
        c:${idAno} c:leciona c:${idCadeira} .
    }
    `

    return Connection.makePost(query)
}


Ano.insertAno = async function(ano){
    var nome = ano.nome 
    var idCurso = ano.idCurso
    var id = idCurso + "_" + nome.replace(/ /g,"_");
    var query = `
    insert data {
        c:${id} a owl:NamedIndividual ,
                        c:Ano .
        c:${id} c:nome "${ano.nome}" . 
        c:${id} c:anoLetivo "${ano.anoLetivo}" .
        c:${id} c:fazParteCurso c:${ano.idCurso} .
    }
    `

    await Connection.makePost(query)
    return {"id" : id}

}

Ano.editarAno = async function(idCurso, designacao, anoLetivo){
    var query = `
    delete{
        c:${idCurso} c:nome ?designacao .
        c:${idCurso} c:anoLetivo ?anoLetivo .
    }
    insert{
        c:${idCurso} c:nome "${designacao}" .
        c:${idCurso} c:anoLetivo "${anoLetivo}" .
    }
    where{
        c:${idCurso} c:nome ?designacao .
        c:${idCurso} c:anoLetivo ?anoLetivo .
    }
    `

    return Connection.makePost(query)
}

Ano.deleteAno = async function(idAno){
    var query = `
    delete{
        c:${idAno} ?p ?a . 
    }
    where{
        c:${idAno} ?p ?a .
    }
    `

    return Connection.makePost(query)
}
