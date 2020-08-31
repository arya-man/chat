const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { firestore } = require('firebase-admin');

admin.initializeApp()
// const bodyParser = require('body-parser');

const app = require('express')()

// const jsonParser = bodyParser.json()

const db = admin.firestore()

app.get("/user", (req, res) => {
    res.send("HEY!")
})

app.post("/sendZap",(req, res) => {
    console.log("REQ", req.body)

    var isError = false

    var selected = Object.keys(req.body.selected)
    var text = `${req.body.user} zapped you and ${selected.length - 1} a ${req.body.type}`

    for (var i = 0; i < selected.length; i += 1) {
        var user1 = selected[i]
        var roomName = user1 < req.body.user ? user1 + '_' + req.body.user : req.body.user + '_' + user1

        if (req.body.selected[user1] === false) {
            var typing = {}
            typing[req.body.user] = false
            typing[user1] = false
            var final = {
                createdBy: req.body.user,
                createdAt: req.body.createdAt,
                members: [req.body.user, user1],
                photoUrl: req.body.photoUrl,
                isGroup: false,
                last_message: text,
                last_date: req.body.createdAt,
                title: '',
                typing: typing
            }

            db.collection('chatrooms').doc(roomName).set(final)
                .then(() => {
                    var seenBy = {}
                    seenBy[user1] = 0
                    var send = {
                        sender: req.body.user,
                        createdAt: req.body.createdAt,
                        type: 'zap',
                        seen: seenBy,
                        content: req.body.content
                    }
                    db.collection('chatrooms').doc(roomName).collection('messages').add(send)
                        .then(() => {
                            db.collection('unread').doc(req.body.user).update({
                                [`${roomName}`]: firestore.FieldValue.increment(1)
                            })
                        })
                        .catch((err) => {
                            isError = true
                            console.log("ERR", err)
                        })
                })
                .catch((err) => {
                    isError = true
                    console.log("ERR", err)
                })
        }

        else {

            var seenBy = {}
            seenBy[user1] = 0
            var send = {
                sender: req.body.user,
                createdAt: req.body.createdAt,
                type: 'zap',
                seen: seenBy,
                content: req.body.content
            }

            db.collection('chatrooms').doc(roomName).collection('messages').add(send)
                .then(() => {
                    db.collection('chatrooms').doc(roomName).update({
                        last_date: req.body.createdAt,
                        last_message: text
                    })
                    .then(() => {
                        db.collection('unread').doc(req.body.user).update({
                            [`${roomName}`]: firestore.FieldValue.increment(1)
                        })
                    })
                    .catch((err) => {
                        isError = true
                        console.log("ERR", err)
                    })
                })
                .catch((err) => {
                    isError = true
                    console.log("ERR", err)
                })
        }
    }

    res.send(isError)
})

app.post("/check" , (req,res) => {
    db.collection('unread').doc('user3').update({
        'hey': 99
    })
    .then(() => {
        res.send(true)
    })
    .catch(() => {
        res.send(false)
    })
})

exports.api = functions.https.onRequest(app)