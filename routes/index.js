var Payload = require('dustmap-payload')
  , async = require('async')
  , util = require('util')
;

var addLinks = function(where, req, others) {
    where['_links'] = others || {};
    where['_links'].self = { href: req.url };
}

module.exports = function(app, orm) {
    var models = orm.models;

    app.post('/upload', function(req, res, next){
        var payload = new Payload();

        payload.on('parsed', function(doc){
            var node_names = Object.keys(doc);
            var node_name;
            var models_to_save = [];

            // TODO: move this to dustmap-payload
            while (node_name = node_names.pop()) {
                var times = Object.keys( doc[node_name] );
                var time;

                while (time = times.pop()) {
                    var measurements = doc[node_name][time];

                    measurements.forEach(function(data){
                        var obj = new models.NodeUpload({
                            data : data
                          , ts : new Date( time * 1000 )
                          , node_name : node_name
                        });
                        models_to_save.push(obj);
                    });
                }
            }

            // all or nothing -> run in transaction
            return orm.transaction(function(err, t){
                if (err) {
                    console.error('Error starting transaction', err);
                    return res.send(500);
                }

                async.each(models_to_save, function(obj, cb){
                    return obj.save(function(err){
                        return cb( err ? err : null );
                    });
                }, function(err){
                    if (err) {
                        console.error('Error on saving, rolling back', err);
                        res.send(409, {
                            serverity : err.severity
                          , detail : err.detail
                        });
                        return t.rollback(function(err){
                            if (err) {
                                return console.error('Error on rolling back', err);
                            }
                        });
                    }
                    return t.commit(function(err){
                        if (err) {
                            console.error('Error on commit', err);
                            return res.send(500);
                        }
                        return res.send(201);
                    });
                });
            });
        });

        payload.on('error', function(whatever, errors){
            res.send(409, errors);
        });

        req.pipe(payload);
    });

    
    app.get('/nodes', function(req, res){
        models.Node.find().only('name', 'id').run(function(err, nodes){
            if (err)
                return res.send(400, err);

            var doc = {
                count : nodes.length
            };

            var node_links = nodes.map(function(node){
                return {
                    href : util.format('/node/%d', node.id)
                  , title : node.name
                }
            });
            addLinks(doc, req, {
                node : node_links
            });

            res.send(doc);
        });
    });

    app.get('/nodes/:node_id', function(req, res){
        models.Node.get(req.params.node_id, function(err, node){
            if (err)
                return res.send(400, err);

            addLinks(node, req, {
                'uploads' : { href : util.format('/node/%d/uploads', node.id) }
            })

            res.send(node);
        });
    });

    app.get('/nodes/:node_id/uploads', function(req, res){
        models.Upload.find({node:req.params.node_id}).only('ts', 'id').run(function(err, uploads){
            if (err)
                return res.send(400, err);

            var doc = {
                count : uploads.length
            };

            var upload_links = uploads.map(function(upload){
                return {
                    href : util.format('/uploads/%d', upload.id)
                  , title : upload.ts.toISOString()
                }
            });
            addLinks(doc, req, {
                upload : upload_links
            });

            res.send(doc);
        });
    });
    
    app.get('/uploads/:upload_id', function(req, res){
        models.Measurement.find({upload:req.params.upload_id}).only('id', 'data').run(function(err, measurements){
            if (err)
                return res.send(400, err);

            var doc = {
                count : measurements.length
            };

            var measurement_links = measurements.map(function(m){
                return {
                    href : util.format('/measurements/%d', m.id)
                  , title : m.data.type
                }
            });
            addLinks(doc, req, {
                measurement : measurement_links
            });

            res.send(doc);
        });
    });

    app.get('/measurements/:m_id', function(req, res){
        models.Measurement.get(req.params.m_id, function(err, measurement){
            if (err)
                return res.send(400, err);

            measurement.hasUpload(function(){
                console.log( arguments );
            });
            addLinks(measurement, req);

            res.send(measurement);
        });
    });

};
