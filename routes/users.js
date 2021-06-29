const express = require('express')
const router = express.Router()

const db = require('../db/dbConfig')

const { admin } = require('./adminConfig')
var firebase = require("firebase/app");



//get user info
//tested 
router.get('/info/:email', (req, res) => {
    const email = req.params.email

    db.execute('SELECT * FROM users WHERE email=? LIMIT 1;', [email], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'user does not exist'
        })

        return res.status(200).json(row[0])
    })
})


//notifi

router.get('/notification_test/:notification_token', (req, res) => {
     const notification_token = req.params.notification_token
 
     db.execute('SELECT * FROM users WHERE notification_token=?;', [notification_token], (err, row) => {
         if (err) return res.status(500).json({
            message: err
          })

          if (row < 1) return res.status(404).json({
              message: 'user does not exist'
          })

          return res.status(200).json(row)
      })
  })





 router.get('/', (req, res) => {
      db.execute('SELECT * FROM users;', [id], (err, row) => {
          if (err) return res.status(500).json({
              message: err
          })

          if (row < 1) return res.status(404).json({
              message: 'user does not exist'
          })
          return res.status(200).json(row)
      })
  })


//get lis of approved child by parent
//done by shahd 
//tested
router.get('/children/:parentId', (req, res) => {
    const parentId = req.params.parentId

    //TO-DO get all users linked to parent from db
    db.execute('SELECT parent_linked_child.id,parent_linked_child.child_id,parent_linked_child.parent_id,users.first_name,users.last_name,users.email,users.country,users.avatar_id,users.points FROM parent_linked_child JOIN users WHERE parent_id=? AND approved=1 AND users.id = child_id ORDER BY parent_linked_child.created_at DESC ;;', [parentId], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'parent has no children'
        })

        return res.status(200).json(row)
    })

    // res.status(200).json({
    //     message: 'list of children',
    //     parentId
    //})
})

//edit user info
//done by shahd 
router.put('/info/:id', (req, res) => {
    const id = req.params.id

    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const school = req.body.school
    const country = req.body.country
    const avatarId = req.body.avatarId
    const gender = req.body.gender
    const userType = req.body.userType


    // if (!firstName || !lastName || !email || !country || !gender || !userType) {
    //     return res.status(406).json({
    //         message: "Please complete all require fields"
    //     })
    // }
    //TO-DO edit user data from db
    db.execute('UPDATE users SET first_name= ?,last_name=?,school=?,country=?,avatar_id=? WHERE id=?  LIMIT 1;', [firstName, lastName, school, country, avatarId, id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'user does not exist'
        })

        //return res.status(200).json(row[0])

        return res.status(200).json({
            info: {
                id,
                firstName,
                lastName,
                school,
                country,
                avatarId,
            }
        })
    })
    // res.send('TO DO')
})


//edit notification status
//done by shahd
router.put('/notification/:id', (req, res) => {
    const id = req.params.id

    //TO DO return not allowed if no token

    const notificationToken = req.body.notificationToken //TO CHECK if we can get it agien and send it
    const feedbackNotification = req.body.feedbackNotification || 0
    const requestRespondNotification = req.body.requestRespondNotification || 0
    const requestNotification = req.body.requestNotification || 0


    //TO-DO edit user data to allow notification from db
    db.execute('UPDATE users SET notification_token=?,feedback_notification=?,request_respond_notification=?, request_notification=? WHERE id=?  LIMIT 1;', [notificationToken, feedbackNotification, requestRespondNotification, requestNotification, id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'user does not exist'
        })

        //return res.status(200).json(row[0])

        return res.status(200).json({
            info: {
                notificationToken,
                feedbackNotification,
                requestRespondNotification,
                requestNotification,

            }
        })
    })
    // res.send('TO DO')
})

//DONE
//save user data
router.post('/signup', (req, res) => {
    //firstName, lastName, email, school, country, points, avatarId, gender, userType, isItFirstTime, createdAt
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const school = req.body.school || null
    const country = req.body.country
    const userType = req.body.userType
    const notificationToken = req.body.notificationToken || null
    const feedbackNotification = req.body.feedbackNotification || 0
    const requestRespondNotification = req.body.requestRespondNotification || 0
    const requestNotification = req.body.requestNotification || 0
    const createdAt = new Date().toLocaleString()

    if (!firstName || !lastName || !email || !country || !userType) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    //TO DO save data to db
    db.execute('INSERT INTO users(first_name, last_name, email, school, country, user_type, notification_token, feedback_notification, request_respond_notification, request_notification) VALUES(?,?,?,?,?,?,?,?,?,?);', [firstName, lastName, email, school, country, userType, notificationToken, feedbackNotification, requestRespondNotification, requestNotification], (err, result) => {
        if (err) return res.status(500).json({
            message: err
        })

        return res.status(200).json({
            message: 'success',
            info: {
                id: result.insertId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                school: school,
                country: country,
                points: 0,
                avatarId: 1,
                userType: userType,
                createdAt: createdAt
            }
        })

    })


})

//leaderboard
//done by shahd 
//tested
router.get('/leaderboard/:id', (req, res) => {
    //To DO get top 10 childern points from db
    db.execute('SELECT first_name, last_name,country,points,avatar_id FROM users WHERE user_type=1 ORDER BY points DESC LIMIT 10;', (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        return res.status(200).json(row)
    })
    // res.status(200).send('ok')
})

//user trophies 
//done by shahd 
//tested
router.get('/trophy/:id', (req, res) => { //as an array in the user table 
    const id = req.params.id
    //To DO get list of cild tophies as array   

    db.execute('SELECT * FROM trophy WHERE user_id=? ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there are no trophy'
        })

        return res.status(200).json(row)
    })
})



//REQUESTS

//DONE
//send requist to join class
router.post('/request/:id', (req, res) => {
    const id = req.params.id //parentId

    const childId = req.body.childId //child id
    const parentId = id
    const approved = false

    if (!childId) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

 db.execute('SELECT * FROM parent_linked_child WHERE child_id =? AND parent_id=? ;', [childId, parentId], (err, result) => {
       if (err) return res.status(500).json({
           message: err
         })
         
        if (result.length > 0){
                return res.status(200).json({
               message: 'there is already a request'
                })
         }

    db.execute('INSERT INTO parent_linked_child (child_id,parent_id) VALUES(?,?);', [childId, parentId], (err, result) => {
        if (err) return res.status(500).json({
            message: err
        })

	 db.execute('SELECT notification_token FROM users WHERE id = ?;', [parentId], (err, result) => {
         if (err) return res.status(500).json({
             message: err
         })

sendNoftifi("dchl0ACBaEdyiMEoZwKPYR:APA91bEVZiiXQC9BnkeXpylREAAvEAU0fvcsNMRZee7oSx-YX-URLgxKJufI9Zb1inu_9E_wtV14ezLDPeEL33BlpKcJYgAAIQMQAdftQvPJ0ewJ9p5XLMT6gnFIhHbNqcexdKZ2ZPw1","لديك طلب جديد","لديك طلب انضمام جديد");

})

        return res.status(200).json({
            message: 'parent request sent',
            id: result.insertId
        })


})
    })
})

//get all request not approved in observer side
//done by shahd 
//tested
router.get('/request/:id', (req, res) => {
    const id = req.params.id //observerId

    //TO DO get all not apprved join requests for the observer
    db.execute('SELECT parent_linked_child.id, parent_linked_child.child_id,parent_linked_child.parent_id,users.first_name,users.last_name,users.email,users.country,users.avatar_id FROM parent_linked_child JOIN users WHERE parent_id=? AND approved=0 AND users.id = child_id ORDER BY parent_linked_child.created_at DESC ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'parent has no children'
        })

        return res.status(200).json(row)
    })
    // res.status(200).json({
    //     message: 'list of requests',
    //     id
    // })
})

//aprove a request
//done by shahd 
router.put('/request/:requestId', (req, res) => {
    const requestId = req.params.requestId

    const approved = req.body.approved //TRUE or FALSE

    //check data
    if (approved == undefined) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    //approved
    if (approved) {
        //TO DO update db to be approved
        //test 
        db.execute('UPDATE parent_linked_child SET approved=1 WHERE id=? ;', [requestId], (err, row) => {
            if (err) return res.status(500).json({
                message: err
            })

 sendNoftifi("eodQV8SxAU4hs3p1o0aeWh:APA91bELlXqn14N4iW85_ROjjvatJkp3rQRRL6NBfnsAzLGw4a-YRpCv24Zb72BWR3kZkBJfAZxGwgpmBdrywlCNDMdfjAgZX1Bqaf-2Eh6BLwSqO42748TAi79OaYP7ukVTv09SjqeO" , "لقد تم قبول طلبك","لقد تم قبول طلب انضمامك عند احد الوالدين");


            if (row < 1) return res.status(404).json({
                message: 'reqest does not exist'
            })

            return res.status(200).json(row)
        })
        //end test 
        // return res.status(200).json({
        //     message: 'request approved',
        //     requestId
        // })
    }

    //not approved
    if (!approved) {
        //TO DO delete request
        db.execute('DELETE FROM parent_linked_child WHERE id=? ;', [requestId], (err, row) => {
            if (err) return res.status(500).json({
                message: err
            })
            return res.status(200).json(row)
        })

        // return res.status(200).json({
        //     message: 'request deleted',
        //     requestId
        // })
    }

})


//----------------------------------------------------added by shahd

//done by shahd
//delete user 
router.delete("/delete/:id", (req, res) => {

    const id = req.params.id

    db.execute('DELETE FROM users WHERE id=? ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })
        return res.status(200).json(row)
    })

})

//done by shahd
//remove from parents 
router.delete("/removechild/:childId", (req, res) => {

    const childId = req.params.childId
    const userId = req.body.userId

    db.execute('DELETE FROM parent_linked_child WHERE  child_id=? AND parent_id=?;', [childId, userId], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })
        return res.status(200).json(row)
    })

})

//the sending notifi
//------------------------------------------------------------
// new edited
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

//the sending notifi
router.post("/sending_notification/:token", (req, res) => {
    const user_token = req.params.token
    const user_id = req.body.user_id
    const title = req.body.title
    const body = req.body.body


    if (!title || !body || !user_id) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    const message_notification = {
        notification: {
            title: title,
            body: body
        }
    };



    var registrationToken = user_token;


    admin.messaging().sendToDevice(registrationToken, message_notification, notification_options)
        .then(response => {

            console.log(response)
            res.status(200).send("Notification sent successfully")
        })
        .catch(error => {
            console.log(error);
        });

})

function sendNoftifi(user_token,title,body){

     const message_notification = {
         notification: {
             title: title,
             body: body
         }
     };

     var registrationToken = user_token;
     admin.messaging().sendToDevice(registrationToken, message_notification, notification_options)
         .then(response => {
             console.log(response)
//             res.status(200).send("Notification sent successfully")
         })
         .catch(error => {
             console.log(error);
         });
}

module.exports = router

