const express = require('express')
const _ = require('lodash')

const db = require('../db/dbConfig')

const router = express.Router()


 const { admin } = require('./adminConfig')
  var firebase = require("firebase/app");

//PROJECTS

// get all projects
//done by shahd
router.get('/', (req, res) => {


    db.execute('SELECT projects.id , projects.title, projects.level , projects.tags, projects.description ,projects.instructions , projects.source , media.media_url , media.media_type  FROM media JOIN projects where projects.id=media.project_id AND media.is_solution=0 ORDER BY projects.created_at DESC;', (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there is no projects'
        })

        return res.status(200).json(row)
    })
    // res.status(200).json({
    //     message: 'success',
    //     info: {
    //         msg: 'list of projects'
    //     }
    // })
})

//DONE
//post new project
router.post('/', (req, res) => {
    const title = req.body.title
    const level =req.body.level
    const tags = req.body.tags
    const descriptions = req.body.descriptions
    const instruction = req.body.instruction
    const source =req.body.source

    if (!title || !level || !tags || !descriptions || !instruction || !source ) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    db.execute('INSERT INTO projects (title, level, tags, description,  instructions, source ) VALUES(?,?,?,?,?,?)', [title, level, tags, descriptions, instruction, source], (err, result) => {
        if (err) return res.status(500).json({
            message: err
        })

        return res.status(200).json({
            message: 'project add please add media',
            info: {
                projectId: result.insertId,
                title,
                level,
                tags,
                descriptions,
              instruction,
                source
            }
        })
    })
})

//get a project by id
//done by shahd
router.get('/:id', (req, res) => {
    const id = req.params.id

    //TO DO get project info and project media
    db.execute('SELECT * FROM projects WHERE id=? LIMIT 1;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'project does not exist'
        })

        return res.status(200).json(row[0])
    })
    // return res.status(200).json({
    //     message: 'project',
    //     id
    // })
})



//SOLUTIONS

// get all solutions for a child
//done by shahd
router.get('/solutions/child/:childId', (req, res) => {
    const childId = req.params.childId

    //TO DO get list of all solutions info for a child
    db.execute('SELECT users.id ,users.first_name ,users.last_name, solutions.id AS solutions_id ,solutions.comment , solutions.is_reviewed, solutions.class_id, solutions.feedback, solutions.is_it_correct ,media.media_url, media.media_type ,projects.title, projects.level ,projects.tags, projects.source FROM solutions JOIN media ON solutions.id=media.solution_id JOIN users ON solutions.user_id = users.id JOIN projects ON solutions.project_id=projects.id where solutions.user_id = ? ORDER BY solutions.created_at DESC;', [childId], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there is no solutions '
        })

        return res.status(200).json(row)
    })

    // res.status(200).json({
    //     message: 'success',
    //     info: 
    //         msg: 'list of solutions'
    //     }
    // })
})


// get all solutions for a class //orderd by reviewed 0 first 
//done by shahd
router.get('/solutions/class/:classId', (req, res) => {
    const classId = req.params.classId

    //TO DO get list of all solutions info for a class
    db.execute('SELECT users.id AS user_id , solutions.id AS solutions_id ,users.first_name ,users.last_name, solutions.comment ,solutions.is_reviewed, solutions.class_id, solutions.feedback, solutions.is_it_correct ,media.media_url ,projects.title, projects.level ,projects.tags FROM solutions JOIN media ON solutions.id=media.solution_id JOIN users ON solutions.user_id = users.id JOIN projects ON solutions.project_id=projects.id where solutions.class_id = ? ORDER BY solutions.is_reviewed ASC;', [classId], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there is no solutions in this class'
        })

        return res.status(200).json(row)
    })

    // res.status(200).json({
    //     message: 'success',
    //     info: {
    //         msg: 'list of solutions for a class'
    //     }
    // })
})

//DONE
//added points by shahd 
//finished points and trophy 
router.post('/solutions/:projectId', (req, res) => {
    const projectId = req.params.projectId
    const userId = req.body.userId
    const comment = req.body.comment || null
    const classId = req.body.classId || null

    //points
    const pointsByLevel = req.body.level || 0 //edited

    //trophy 
    const numberOfTrophyByTags = {};

    if (!userId) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    //1 ==easy
    //2 == meduim 
    //3 == hard

    //the insert of the solution 
    //DONE
    db.execute('INSERT INTO solutions (user_id, project_id, comment, class_id) VALUES(?,?,?,?);', [userId, projectId, comment, classId], (err, result) => {

        if (err) return res.status(500).json({
            message: err
        })


        db.execute('UPDATE users SET points = points + ? WHERE id=? ;', [pointsByLevel, userId], (err) => {
            if (err) return res.status(500).json({
                message: err
            })
        })

        //trophy function 
        db.execute('SELECT * FROM solutions JOIN projects WHERE solutions.project_id = projects.id AND user_id=?;', [userId], (err, rows) => {
            if (err) return res.status(500).json({
                message: err
            })

            if (rows.length > 0) {
                //creat object to count each subject
                for (let i = 1; i <= 4; i++) {
                    numberOfTrophyByTags[i] = _.filter(rows, (item) => item.tags.indexOf(i) != -1).length;
                }

                // console.log(numberOfTrophyByTags)
                //check and give trophy
                for (let i = 1; i <= 4; i++) {
                    if (rows[rows.length-1 ].tags.indexOf(i) != -1) {
                        if (numberOfTrophyByTags[i] == 3) {
                            db.execute('INSERT INTO trophy(user_id, type) VALUES (?,?)', [userId, i + "1"], (err, end) => {
                                if (err) return res.status(500).json({
                                    message: err
                                })
                            })
                        } else if (numberOfTrophyByTags[i] == 5) {
                            db.execute('INSERT INTO trophy(user_id, type) VALUES (?,?)', [userId, i + "2"], (err, end) => {
                                if (err) return res.status(500).json({
                                    message: err
                                })
                            })
                        } else if (numberOfTrophyByTags[i] == 10) {
                            db.execute('INSERT INTO trophy(user_id, type) VALUES (?,?)', [userId, i + "3"], (err, end) => {
                                if (err) return res.status(500).json({
                                    message: err
                                })
                            })
                        } else if (numberOfTrophyByTags[i] == 12) {
                            db.execute('INSERT INTO trophy(user_id, type) VALUES (?,?)', [userId, i + "4"], (err, end) => {
                                if (err) return res.status(500).json({
                                    message: err
                                })
                            })
                        }
                    }
                }
            }
        })

        return res.status(200).json({
            message: 'solution add please add media',
            info: {
                solutionId: result.insertId,
                projectId,
                userId,
                comment,
                classId
            }
        })
    })
})

//get a solutions by id
//done bu shahd
router.get('/solutions/:id', (req, res) => {
    const id = req.params.id

    //TO DO get solutions info and solutions media
    db.execute('SELECT users.id AS users_id , solutions.id AS soultion_id , users.id AS users_id ,users.first_name ,users.last_name, solutions.comment , solutions.is_reviewed, solutions.class_id, solutions.feedback, solutions.is_it_correct ,media.media_url ,projects.title, projects.level ,projects.tags FROM solutions JOIN media ON solutions.id=media.solution_id JOIN users ON solutions.user_id = users.id JOIN projects ON solutions.project_id=projects.id where solutions.id = ? ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'solutions does not exist'
        })

        return res.status(200).json(row)
    })
    // return res.status(200).json({
    //     message: 'solutions',
    //     id
    // })
})

//update solutions after review
//done by shahd 
//add level in the solution table 
router.put('/solutions/:id', (req, res) => {
    const id = req.params.id//solution id 
    const userId = req.body.userId
    const isReviewed = true
    const feedback = req.body.feedback || "none"
    const isItCorrect = req.body.isItCorrect
    //do we bring the level from the project id ?

    //if we add level n the table we need a quiry for this
    const level = req.body.level || 0
    var pointsByLevel = 0

    //0 ==easy
    //1 == meduim 
    //2 == hard

    if (level == 1)
        pointsByLevel = 1
    if (level == 2)
        pointsByLevel = 2
    if (level == 3)
        pointsByLevel = 3





    if (isItCorrect == undefined) {
        return res.status(406).json({
            message: "can u Please complete all require fields"
        })
    }


sendNoftifi("eodQV8SxAU4hs3p1o0aeWh:APA91bELlXqn14N4iW85_ROjjvatJkp3rQRRL6NBfnsAzLGw4a-YRpCv24Zb72BWR3kZkBJfAZxGwgpmBdrywlCNDMdfjAgZX1Bqaf-2Eh6BLwSqO42748TAi79OaYP7ukVTv09SjqeO" , "لقد تم تصحيح حلك","ادخل عبقر لمشاهده تصحيح حلك وتعليقاته ");


    if (isItCorrect) {

        db.execute('UPDATE solutions SET is_reviewed=1,feedback=?,is_it_correct=1 WHERE id=? ;', [feedback, id], (err, row) => {
            if (err) return res.status(500).json({
                message: err
            })

            db.execute('UPDATE users SET points = points + ? WHERE id=? ;',[ level, userId])

            return res.status(200).json(row)
        })


        // return res.status(406).json({
        //     message: "Please complete all require fields"
        // })
    }
    if (!isItCorrect) {

        db.execute('UPDATE solutions SET is_reviewed=1,feedback=?,is_it_correct=0 WHERE id=? ;', [feedback, id], (err, row) => {
            if (err) return res.status(500).json({
                message: err
            })

            return res.status(200).json(row)
        })


        // return res.status(406).json({
        //     message: "Please complete all require fields"
        // })
    }
    //TO DO update db
    //
    //})
})


//----------------------------------------------------added by shahd

//done by shahd
//get project by stem
router.get('/stem/:stemId', (req, res) => {
    const stemId = req.params.stemId

    db.execute('SELECT * FROM projects WHERE tags LIKE CONCAT ("%",?,"%" );', [stemId], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there is no projects'
        })

        return res.status(200).json(row)
    })

})

//done by shahd 
//search for a name of a project
router.get('/search/:title', (req, res) => {
    const title = req.params.title

    db.execute('SELECT projects.id , projects.title, projects.level , projects.tags, projects.description ,projects.instructions , projects.source , media.media_url , media.media_type  FROM media JOIN projects where projects.id=media.project_id AND projects.title LIKE CONCAT ("%",?,"%") AND media.is_solution=0 ;', [title], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there is no projects'
        })

        return res.status(200).json(row)
    })

})



router.get('/class_solutions/child_class/', (req, res) => {
   if(!req.query.child_id || !req.query.class_id) return res.status(406).json({ message: 'Please provide requirments'})

   const classId = req.query.class_id
   const childId = req.query.child_id 

    //TO DO get list of all solutions info for a class
     db.execute('SELECT users.id AS user_id , solutions.id AS solutions_id ,users.first_name ,users.last_name, solutions.comment ,solutions.is_reviewed, solutions.class_id, solutions.feedback, solutions.is_it_correct ,media.media_url ,projects.title, projects.level ,projects.tags FROM solutions JOIN media ON solutions.id=media.solution_id JOIN users ON solutions.user_id = users.id JOIN projects ON solutions.project_id=projects.id where solutions.class_id = ? AND  users.id= ? ORDER BY solutions.is_reviewed ASC; ', [classId,childId], (err, row) => {
         if (err) return res.status(500).json({
             message: err
         })

         if (row < 1) return res.status(404).json({
             message: 'there is no solutions in this class'
         })

         return res.status(200).json(row)
     })

 })





//delete project by admin 
//done by shahd
router.delete("/delete/:id", (req, res) => {

    const id = req.params.id

    db.execute('DELETE FROM projects WHERE id=? ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })
        return res.status(200).json(row)
    })

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


const notification_options = {
    priority: "high",
     timeToLive: 60 * 60 * 24
 };



module.exports = router
