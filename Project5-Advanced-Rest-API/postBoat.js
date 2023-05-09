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



            /*var keys_array = Object.keys(req.body)
            var new_data = {}
            for (let i = 0; i < keys_array.length; i++) {
                let temp = keys_array[i]
                new_data[temp] = req.body[temp]
            }
            // Adding original key-value pair if not in request body.
            if (!new_data.hasOwnProperty('name')){
                new_data['name'] = boat[0].name}
            if (!new_data.hasOwnProperty('type')){
                new_data['type'] = boat[0].type}
            if (!new_data.hasOwnProperty('length')){
                new_data['length'] = boat[0]['length']
            }
            // Update boat with new data.
            var partial_update = patch_boat(req.params.boat_id, new_data)
            res.status(200).type('json').send('{"Status Code": "200 - Boat successfully updated."}')*/
