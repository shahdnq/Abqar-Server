const express = require('express')

const db = require('../db/dbConfig')

const router = express.Router()

 const { admin } = require('./adminConfig')
  var firebase = require("firebase/app");

//all classes enrolled 
//done by shahd
//tested
router.get('/child/:id', (req, res) => {
    const id = req.params.id

    db.execute('SELECT classes.id AS class_id, classes.name AS class_name,classes.avatar_id,classes.count FROM classes JOIN child_in_class WHERE child_in_class.class_id = classes.id AND child_in_class.user_id = ? AND child_in_class.approved = 1;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there are no classes'
        })

        return res.status(200).json(row)
    })
})

//all classes for teacher
//done by shahd
//tested
router.get('/teacher/:id', (req, res) => {
    const id = req.params.id

    db.execute('SELECT classes.id AS class_id, classes.name AS class_name,classes.avatar_id,classes.count FROM classes  WHERE teacher_id = ?;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there are no classes'
        })

        return res.status(200).json(row)
    })
    // res.status(200).json({
    //     message: 'list of teacher classes',
    //     id
    // })
})

//DONE
//create new class
router.post('/', (req, res) => {
    const teacherId = req.body.teacherId
    const className = req.body.className
const avatar = 1
const count =0

    if (!teacherId || !className) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    db.execute('INSERT INTO classes (name, teacher_id, avatar_id,count) VALUES(?, ?,?,?)', [className, teacherId, avatar,count], (err, result, fields) => {
        if (err) return res.status(500).json({
            message: err
        })
        return res.status(200).json({
            message: 'success',
            info: {
                id: result.insertId,
                //MAYBE we need send qr code image
                teacherId,
                className
            }
        })
    })
})


//get class info
//done by shahd 
//tested
router.get('/:id', (req, res) => {
    const id = req.params.id

    //SELECT classes.id AS class_id, classes.name AS class_name, CONCAT(users.first_name, users.last_name) AS teacher_name FROM classes JOIN users WHERE classes.teacher_id = users.id;
    //TO DO send class info
    db.execute('SELECT classes.id AS class_id, classes.name AS class_name, CONCAT(users.first_name, users.last_name) AS teacher_name, classes.avatar_id,classes.count FROM classes JOIN users WHERE classes.teacher_id = users.id;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there are no class'
        })

        return res.status(200).json(row)
    })
    // res.status(200).json({
    //     message: 'class info',
    //     id
    // })
})

//get class info
//done by shahd 
//tested
router.get('/leaderboard/:id', (req, res) => {
    const id = req.params.id

    //TO DO get all children in class sorted by points
    db.execute('SELECT users.first_name, users.last_name, users.country, users.points, users.avatar_id FROM child_in_class JOIN users  WHERE child_in_class.user_id = users.id AND child_in_class.class_id=? AND approved =1 ORDER BY users.points DESC LIMIT 10;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there are no children'
        })

        return res.status(200).json(row)
    })
})

//done by shahd
//get list of children
//tested
router.get('/children/:id', (req, res) => {
    const id = req.params.id //classId

    //TO DO get all enrolled children in class 
    db.execute('SELECT users.id ,users.email, users.first_name, users.last_name, users.country, users.avatar_id ,users.points, child_in_class.class_id FROM child_in_class JOIN users WHERE child_in_class.user_id = users.id AND class_id=? AND approved =1;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there are no class'
        })

        return res.status(200).json(row)
    })
})


//REQUEST

//DONE
//send requist to join class
router.post('/request/:id', (req, res) => {
    const id = req.params.id //classId

    const userId = req.body.userId
    const classId = id
    const approved = false

    if (!userId) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }
    db.execute('SELECT * FROM child_in_class WHERE user_id =? AND class_id=? ;', [userId, classId], (err, result) => {
        if (err) return res.status(500).json({
            message: err
        })
	
	if (result.length > 0){
        	return res.status(200).json({
            	message: 'there is already a request'
        	})
	}

    

    db.execute('INSERT INTO child_in_class (user_id,class_id) VALUES(?,?);', [userId, classId], (err, result) => {
        if (err) return res.status(500).json({
            message: err
        })

 sendNoftifi( "c5xx1sRCjUjNvrIek1X8IF:APA91bF33Dqxc9Syfb-YZLaP-_gVGnbKU_B-VnGGKza4ekHy3CZIxKgXc0SiT5ULCJkBHgNZCfw4ZHAPuY50m5mqzFNiMDQ-2HOBLK5w_0dJpAWBg5aLx3_u9oLakU_cYDdZ1F5ndOe-" ,"لديك طلب جديد","لديك طلب انضمام جديد لاحد الفصول");

        return res.status(200).json({
            message: 'class request sent',
            id: result.insertId
        })

    })
})
})

//get all request not approved in class
//done by shahd 
//tested
router.get('/request/:id', (req, res) => {
    const id = req.params.id //classId

    db.execute('SELECT child_in_class.id, child_in_class.user_id,child_in_class.class_id,users.first_name,users.last_name,users.email,users.country,users.avatar_id FROM child_in_class JOIN users WHERE class_id=? AND approved=0 AND users.id = child_in_class.user_id ORDER BY child_in_class.created_at DESC ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'class has no reqest'
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
    const classId = req.body.classId
    const approved = req.body.approved

    //check data
    if (approved == undefined || !classId) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    //approved
    if (approved) {
        //TO DO update db to be approved
        db.execute('UPDATE child_in_class SET approved=1 WHERE id=?;', [requestId], (err, row) => {
            if (err) return res.status(500).json({
                message: err
            })

            db.execute('UPDATE classes SET count = count + 1 WHERE id=?  LIMIT 1;', [classId], (err) => { })

	sendNoftifi("eodQV8SxAU4hs3p1o0aeWh:APA91bELlXqn14N4iW85_ROjjvatJkp3rQRRL6NBfnsAzLGw4a-YRpCv24Zb72BWR3kZkBJfAZxGwgpmBdrywlCNDMdfjAgZX1Bqaf-2Eh6BLwSqO42748TAi79OaYP7ukVTv09SjqeO","موافقه على الطلب","لقذ تم قبول طلب انضمامك للفصل ادخل وشارك حلولك");


            if (row < 1) return res.status(404).json({
                message: 'reqest does not exist'
            })

            return res.status(200).json({
                message: 'request approved',
                requestId
            })
        })
    }

    //not approved
    if (!approved) {
        //TO DO delete request
        db.execute('DELETE FROM child_in_class WHERE id=? ;', [requestId], (err, row) => {
            if (err) return res.status(500).json({
                message: err
            })
            return res.status(200).json({
                message: 'request deleted',
                requestId
            })
        })
    }

})

//----------------------------------------------------added by shahd

//delete classroom 
router.delete("/delete/:id", (req, res) => {

    const id = req.params.id

    db.execute('DELETE FROM classes WHERE id=? ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        db.execute('DELETE FROM child_in_class WHERE class_id = ? ;', [id], (err, row) => {
            if (err) return res.status(500).json({
                message: err
            })
            return res.status(200).json({
                message: 'request deleted',
                id
            })
        })
    })
})

//done by shahd 
//remove the child from class
router.delete("/removechild/:childId", (req, res) => {

    const childId = req.params.childId
    const classId = req.body.classId

    db.execute('DELETE FROM child_in_class WHERE user_id=? AND class_id=?;', [childId, classId], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        db.execute('UPDATE classes SET count = count - 1 WHERE id=?;', [classId], (err,row) => {
            if (err) return res.status(500).json({
                message: err
            })
            return res.status(200).json({
                message: 'child deleted',
                childId
            })
        })

    })
})

//edit class roo//done by shahd 
router.put('/classInfo/:id', (req, res) => {
    const id = req.params.id
    const className = req.body.className
    const classAvatar = req.body.classAvatar


    db.execute('UPDATE classes SET name=?, avatar_id=? WHERE id=?  LIMIT 1;', [className, classAvatar, id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'user does not exist'
        })

        return res.status(200).json({
            info: {
                id,
                firstName,
                lastName,
                school,
                country,
                avatarId
            }
        })
    })


})


const notification_options = {
    priority: "high",
     timeToLive: 60 * 60 * 24
 };


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
//              res.status(200).send("Notification sent successfully")
          })
          .catch(error => {
              console.log(error);
          });
 }

module.exports = router
