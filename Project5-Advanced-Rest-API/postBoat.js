// POST - Create a new Boat.
router.post('/', function(req, res){
    const nameCheck = checkUniqueName(req.body.name)
    .then((nameCheck) => {
        if (nameCheck == 1){
            res.status(403).type('json').send(`Status 403: The name provided is already in use.`).end()
        }
    })
    
    if (req.body.name == null || req.body.type == null || req.body.length == null) {
        res.status(400).type('json').send('{"Error": "The request object is missing at least one of the required attributes"}')
    }
    else {
        // Checking if name is unique.

        /*const nameCheck = checkUniqueName(req.body.name)
        .then((data) => {
            if (data){
                 res.status(403).send(`Status 403: The name ${req.body.name} is already in use.`)
            } else {
                post_boat(req.body.name, req.body.type, req.body.length)
                .then( key => {
                    var data = datastore.get(key);
                    data.then(boatData => {
                    res.status(201).send(stringifyExample(key.id, boatData[0].name, boatData[0].type, boatData[0].length, req.protocol + '://' + req.get("host") + req.baseUrl + '/' + key.id))
                    })
                })
            }
        })
        if (nameCheck){
            res.status(403).send(`Status 403: The name ${req.body.name} is already in use.`)
        }*/


        post_boat(req.body.name, req.body.type, req.body.length)
        .then( key => {
            var data = datastore.get(key);
            data.then(boatData => {
                res.status(201).type('json').send(stringifyExample(key.id, boatData[0].name, boatData[0].type, boatData[0].length, req.protocol + '://' + req.get("host") + req.baseUrl + '/' + key.id))
            })
        })
    }
})
