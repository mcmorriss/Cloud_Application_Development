const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const ds = require('./datastore');

const datastore = ds.datastore;

const GUEST = "Guest";
const LOAD = "Load"; 

router.use(bodyParser.json());

function stringifyExample(idValue, volumeVal, itemVal, createVal, carrierValue, selfUrl){
	var entities = carrierValue;
	var data = [];
	var boatUrl = "http://localhost:8080/boats/";   
	//entities.forEach((entity) => {data.push('{ "id": "' + entity + '", "self": "'+ loadUrl + entity + '"}')});
	return '{ "id": "' + idValue  + '", "volume": ' + volumeVal + ', "item": "' + itemVal + '", "creation_date": "' + createVal + '", "carrier": ' + carrierValue + ', "self": "' + selfUrl + '"}'; 
}

/*
function stringifyExample(idValue, volumeVal, itemVal, createValue, protocolVal, hostVal, baseVal) {
    return '{ "id": "' + idValue + '",\n "volume": ' + parseInt(volumeVal) + ',\n "item": "' + itemVal + '",\n "creation_date": "' + createValue + '",\n "self": "' + protocolVal + "://" + hostVal + baseVal + "/" + idValue + '"\n}';
}*/

function stringifyURL(protocolVal, hostVal, baseVal){
    return '{ "self": "' + protocolVal + "://" + hostVal + baseVal + "/" + idValue + '"\n}';
}
/* ------------- Begin Load Model Functions ------------- */
function post_load(volume, item, creation_date){
    var key = datastore.key(LOAD);
    data = [];
	const new_load = {"volume": volume,
    "item": item,
    "carrier": data, 
    "creation_date": creation_date
    };
	return datastore.save({"key":key, "data":new_load}).then(() => {return key});
}

function get_loads(req){
    var q = datastore.createQuery(LOAD).limit(3);
    const results = {};
    if(Object.keys(req.query).includes("cursor")){
        console.log(req.query);
        prev = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + req.query.cursor;
        q = q.start(req.query.cursor);
    }
	return datastore.runQuery(q).then( (entities) => {
            console.log(entities);
            results.items = entities[0].map(ds.fromDatastore);
            if(entities[1].moreResults !== ds.Datastore.NO_MORE_RESULTS ){
                results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
            }
			return results;
		});
}

function get_load(id){
    const key = datastore.key([LOAD, parseInt(id,10)]); 
    return datastore.get(key); 
}


function put_load(id, volume, item, creation_date) {
    const key = datastore.key([LOAD, parseInt(id,10)]);
    const load  = {"volume": volume,
    "item": item, 
    "creation_date": creation_date
    };
    return datastore.update({"key":key, "data":load}).then(() => {return key});
}

function delete_load(id){
    const key = datastore.key([LOAD, parseInt(id,10)]);
    return datastore.delete(key);
}

/* ------------- End Load Model Functions ------------- */

/* ------------- Begin Load Controller Functions ------------- */

router.get('/', function(req, res){
    const loads = get_loads(req)
	.then( (loads) => {
        res.status(200).json(loads);
    });
});

router.get('/:load_id', function(req, res) {
    const load = get_load(req.params.load_id)
    .then( (load) => {
        if (load[0] == null) {
            res.status(404).json({"Error": "No load with this load_id exists"});
        }
        else {
            res.status(200).type('json').send(stringifyExample(req.params.load_id, load[0].volume, load[0].item, load[0].creation_date, load[0].carrier, req.protocol + '://' + req.get("host") + req.baseUrl + '/' + req.params.load_id));
        }
    })
});

router.post('/', function(req, res){
    console.log(req.body);
    if (req.body.volume == null || req.body.item == null || req.body.creation_date == null) {
        res.status(400).send('{"Error": "The request object is missing at least one of the required attributes"}')
    }
    else {
    post_load(req.body.volume, req.body.item, req.body.creation_date)
    .then( key => {
        var data = datastore.get(key);
        data.then(loadData => {
            res.status(201).send(stringifyExample(key.id, loadData[0].volume, loadData[0].item, loadData[0].creation_date, loadData[0].carrier, req.protocol + '://' + req.get("host") + req.baseUrl + '/' + key.id));
        })
        //res.status(201).send(stringifyExample(key.id, req.body.volume, req.body.item, req.body.creation_date, req.protocol, req.get("host"), req.baseUrl));
        });
    }
});

router.put('/:load_id', function(req,res) {
    const load = get_load(req.params.load_id)
    .then( (load) => {
        if (load[0] == null) {
            res.status(404).json({"Error": "No load with this load_id exists"});
        } else if (req.body.volume == null || req.body.item == null || req.body.creation_date == null) {
           res.status(400).send('{"Error": "The request object is missing at least one of the required attributes"}') 
        } else {
            put_load(req.params.load_id, req.body.volume, req.body.item, req.body.creation_date)
            res.status(200).type('json').send(stringifyExample(req.params.load_id, load[0].volume, load[0].item, load[0].creation_date, req.protocol, req.get("host"), req.baseUrl));
        }
    });
});

router.delete('/:load_id', function(req, res){
    const load = get_load(req.params.load_id)
	.then( (load) => {
        if (load[0] == null) {
            res.status(404).json({"Error": "No load with this load_id exists"});
        }
        else {
            delete_load(req.params.load_id).then(res.status(204).end());  
        }    
    });
});
/* ------------- End Load Controller Functions ------------- */

module.exports = router;
