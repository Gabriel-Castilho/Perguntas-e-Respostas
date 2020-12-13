const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const connection = require("./database/database");
const QuestionModel = require("./database/Question")
const AnswerModel = require("./database/Answer")

connection.authenticate().then(() => {
    console.log("Conectou")
}).catch((err) => {
    console.log("error " + err)
})

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get("/", (req, res) => {
    //ORDER É A ORDEM DO ID DO BANCO
    QuestionModel.findAll({ raw: true, order: [['id', 'DESC']] }).then(question => {
        res.render("index", {
            questions: question
        });
    })
})



app.get("/perguntar", (req, res) => {
    res.render("question")
})

app.post("/salvarpergunta", (req, res) => {
    var title = req.body.title;
    var description = req.body.description
    //INSERT INTO 
    QuestionModel.create({
        title: title,
        description: description
    }).then(() => {
        console.log("pergunta salva")
        res.redirect("/")
    }).catch((err) => {
        console.log("erro " + err)
    })


})

app.get("/pergunta/:id", (req, res) => {
    var id = req.params.id;
    QuestionModel.findOne({
        where: { id: id }
        
    }).then(question => {
        if (question != undefined) {
            AnswerModel.findAll({
                where: {
                    questionId: question.id
                }, order: [['id','DESC']]
            }).then(answer => {
                res.render("ask", {
                    question: question,
                    answer:answer
                })
            })

        } else {

            res.redirect("/")

        }
    })

})

app.post("/responder", (req, res) => {
    var body = req.body.body;
    var questionId = req.body.question;
    AnswerModel.create({
        body: body,
        questionId: questionId
    }).then(() => {
        res.redirect("/pergunta/" + questionId)
    })


})
app.listen(8000, () => {
    console.log("app rodando")
})