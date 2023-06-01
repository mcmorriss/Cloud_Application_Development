const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const ds = require('./datastore');
const datastore = ds.datastore;
const {Datastore} = ds.Datastore;
const json2html = require('json-to-html');

const BOAT = "Boat"; 

router.use(bodyParser.json());

// Stringify
function stringifyExample(idValue, nameValue, typeValue, lengthValue, selfUrl){
	return '{ "id": "' + idValue  + '", "name": "' + nameValue + '", "type": "' + typeValue + '", "length": ' + lengthValue + ', "self": "' + selfUrl + '"}'; 
}

function getAllBoats(){
    const query = datastore.createQuery(BOAT)
    return datastore.runQuery(query).then((entities) => {
        return entities[0].map(ds.fromDatastore)
    })}

async function checkUniqueName(name) {
    const boats_arr = await getAllBoats();
    var isUnique = 0;
    boats_arr.forEach((boat) => {
        if (boat.name === name){
            isUnique = 1
        }
    })
    if (isUnique == 0){
        const val = 0;
        return val;
    } else {
        const val = 1;
        return val;
    }

}


/* ------------- Begin Model Functions ------------- */

function get_boat(id){
    const key = datastore.key([BOAT, parseInt(id,10)]); 
    return datastore.get(key); 
}

function post_boat(name, type, length) {
    var key = datastore.key(BOAT);
    const new_boat = { 
        "name": name, 
        "type": type, 
        "length": length
    };
    return datastore.save({ "key": key, "data": new_boat }).then(() => { return key });
}

function patch_boat(id, patch_data){
    var key = datastore.key([BOAT, parseInt(id,10)]);
    var data = patch_data;
    return datastore.save({"key": key, "data": data}).then(() => {return key})
}

function delete_boat(id){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    return datastore.delete(key);
}

/* ------------- End Model Functions --------------- */



/* ------------- Begin Controller Functions ------------- */

// GET - Get a boat from boat_id.
router.get('/:boat_id', function(req, res){
    const boat = get_boat(req.params.boat_id)
    .then( (boat) => {
        // Accepts json or text/html only.
        const content_type = req.headers['content-type']
        const accepts = req.accepts(['application/json', 'text/html']);
        if (!accepts){
            res.status(406).type('json').send('{"Status 406": "Accept header has unsupported MIME type."}');
        } else if (content_type != 'application/json'){
            res.status(415).type('json').send('{"Status 415": "Client request contains unsupported MIME type, please use application/json only."}');
        } else if (boat[0] == null) {
            res.status(404).type('json').send('{"Status 404": "No boat with this boat_id exists."}');
        } else if (accepts === 'application/json'){
            res.status(200).type('json').send(stringifyExample(req.params.boat_id, boat[0].name, boat[0].type, boat[0].length, req.protocol + '://' + req.get("host") + req.baseUrl + '/' + req.params.boat_id))
        } else if (accepts === 'text/html'){
            res.status(200).send(json2html(boat[0]).slice(1,-1));
        }
        else {
            res.status(500).send('Content type got messed up!');
        }
    })
})


// POST - Create a new Boat.
router.post('/', function(req, res){
    if (req.body.name == null || req.body.type == null || req.body.length == null) {
        res.status(400).type('json').send('{"Status Code": "400 - The request object is missing at least one of the required attributes"}')
    }
    else {
        checkUniqueName(req.body.name)
        .then((nameCheck) => {
            if (nameCheck == 1){
                res.status(403).type('json').send('{"Status Code": "403 - Boat name must be unique."}').end()
            } else {
                post_boat(req.body.name, req.body.type, req.body.length)
                .then( key => {
                    var data = datastore.get(key);
                    data.then(boatData => {
                    res.status(201).type('json').send(stringifyExample(key.id, boatData[0].name, boatData[0].type, boatData[0].length, req.protocol + '://' + req.get("host") + req.baseUrl + '/' + key.id))
                })})
            }
        })
    }
})

// PATCH - Edit any subset of attributes of a boat (Ex: Only name or name and length).
router.patch('/:boat_id', function(req, res){
    const boat = get_boat(req.params.boat_id)
    .then( (boat) => {
        if (boat[0] == null){
            res.status(404).type('json').send('{"Status Code": "404: No boat with this boat_id exists."}');
        } else if (req.body.name || req.body.type || req.body.length) {
            // Checking uniqueness of name
            if (req.body.name){
                // If name request is same as current name attribute (Error 403).
                if(req.body.name == boat[0].name){
                    return res.status(403).type('json').send('{"Status Code": "403 - Name must be unique."}').end() 
                } else {
                // Check if name is unique before updating.
                checkUniqueName(req.body.name)
                .then((nameCheck) => {
                    if (nameCheck == 1){
                        return res.status(403).type('json').send('{"Status Code": "403 - Boat name must be unique."}').end()
                    }})
                }
            } else {
                // Copying req body into new object.
                var keys_array = Object.keys(req.body)
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
                patch_boat(req.params.boat_id, new_data)
                .then( key => {
                    var data = datastore.get(key);
                    data.then(boatData => {
                    res.status(200).type('json').send(stringifyExample(key.id, boatData[0].name, boatData[0].type, boatData[0].length, req.protocol + '://' + req.get("host") + req.baseUrl + '/' + key.id)).end();
                })})
              
            }
        } else {
            var boat = patch_boat(req.params.boat_id, req.body)
            res.status(400).type('json').send('{"Status Code": "400: Request body must include "name", "type", or "length". "}');
        }
    })
})

// PUT - Edit/update all attributes of a boat.
router.put('/:boat_id', function(req, res){
    const boat = get_boat(req.params.boat_id)
    .then( (boat) => {
        // Error - Invalid boat id.
        if (boat[0] == null){
            res.status(404).type('json').send('{"Status Code": "404: No boat with this boat_id exists."}');
        // Error - Missing an attribute.
        } else if (!req.body.name || !req.body.type || !req.body.length){
            res.status(400).type('json').send('{"Status Code": "400: Request body must include "name", "type", or "length". "}');
        } else {
            patch_boat(req.params.boat_id, req.body)
            res.redirect(303, req.protocol + '://' + req.get("host") + req.baseUrl + '/' + req.params.boat_id)
        }
    })
})


// DELETE a boat.
router.delete('/:boat_id', function(req, res){
    const boat = get_boat(req.params.boat_id)
	.then( (boat) => {
        if (boat[0] == null) {
            res.status(404).type('json').send('{"Status Code": "404 - No boat with this boat_id exists"}');
        }
        else {
            delete_boat(req.params.boat_id).then(res.status(204).end());  
        }    
    });
});

// 405 Error code of trying to DELETE root url, no boat_id provided.
router.delete('/', function(req, res){
    res.status(405).type('json').send('{"Status Code": "405 - Cannot delete all boats. Must include boat_id in url."}').end();
});



/* ------------- End Controller Functions ------------- */

module.exports = router;