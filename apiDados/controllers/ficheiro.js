var Ficheiro = module.exports

var Connection = require('./connection')
var Publicacao = require('./publicacao')
var Ano = require('./ano')
var nanoid = require('nanoid')

Ficheiro.getFicheiros = async function(){
    var query = `
    select (STRAFTER(STR(?cours), 'UMbook#') as ?ficheiro) where{
        ?cours a c:Ficheiro .
    }
    `
    return Connection.makeQuery(query)
    
}

Ficheiro.getFicheiroAtomica = async function(idFicheiro){
    var query = `
    select ?nome ?type ?size ?localizacao (STRAFTER(STR(?inseridoEm), 'UMbook#') as ?idPublicacao) where{
        c:${idFicheiro} a c:Ficheiro .
        c:${idFicheiro} c:nome ?nome .
        c:${idFicheiro} c:type ?type .
        c:${idFicheiro} c:size ?size .
        c:${idFicheiro} c:path ?localizacao .
        c:${idFicheiro} c:guardadoEm ?inseridoEm .
    }
    `

    return Connection.makeQuery(query)
}

Ficheiro.getFicheiroPath = async function(idFicheiro){
    var query = `
    select ?localizacao where{
        c:${idFicheiro} c:path ?localizacao .
    }
    `

    return Connection.makeQuery(query)
}


Ficheiro.insereFicheiro = async function(body){
    var id = nanoid.nanoid()
    var query = `
    insert data {
        c:${id} a owl:NamedIndividual ,
                        c:Ficheiro .
            c:${id} c:guardadoEm c:${body.guardadoEm} .
            c:${id} c:nome "${body.nome}" .
            c:${id} c:path "${body.path}" .
            c:${id} c:size "${body.size}" .
            c:${id} c:type "${body.type}" .
    }
    `

    await Connection.makePost(query)
    return {id : id}
}