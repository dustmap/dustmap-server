"use strict";

var Payload = require('dustmap-payload')
  , async = require('async')
  , HAL = require('../lib/hal.js')
;

module.exports = function(app) {

    app.post('/upload', function(req, res){
        var payload = new Payload();

        payload.on('parsed', function(doc){
            var node_names = Object.keys(doc);
            var node_name;
            var models_to_save = [];

            function addMeasurement(data) {
                var obj = new req.models.NodeUpload({
                    data : data
                  , ts : new Date( time * 1000 )
                  , node_name : node_name
                });
                models_to_save.push(obj);                
            }

            // TODO: move this to dustmap-payload
            while ( (node_name = node_names.pop()) ) {
                var times = Object.keys( doc[node_name] );
                var time;

                while ( (time = times.pop()) ) {
                    var measurements = doc[node_name][time];
                    measurements.forEach(addMeasurement);
                }
            }

            // all or nothing -> run in transaction
            return req.db.transaction(function(err, t){
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
                        
                        var body = {};
                        var uploads = {};
                        var nodes = {};
                        models_to_save.forEach(function(instance){
                            var upload = instance.upload;
                            var node = instance.node_id;

                            if (! nodes.hasOwnProperty(node)) {
                                nodes[node] = true;
                                HAL.link(body, 'node', '/nodes/'.concat(node));
                            }

                            if (! uploads.hasOwnProperty(upload)) {
                                uploads[upload] = true;
                                HAL.link(body, 'upload', '/uploads/'.concat(upload));
                            }
                        });

                        return res.send(201, body);
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
        var query = req.models.Node.find()
            .offset(req.page.offset)
            .limit(req.page.limit)
        ;

        if (req.query.bbox) {
            // bbox = left;bottom;right;top
            var bbox = req.query.bbox.split(';');
            var box = [
                bbox[1] , bbox[0] , bbox[3] , bbox[2]
            ].join(',');

            query.where('box ? @> location', [box]);
        }

        query.run(function(err, nodes){
            if (err)
                return res.send(400, err);

            async.map(nodes, function(node, cb){
                HAL.link(node, 'self', '/nodes/'.concat(node.id));

                req.models.Upload.find({'node':node.id}).order('ts', 'Z').limit(1).run(function(err, uploads){
                    if (err)
                        return cb(err);
                    if (uploads.length <= 0)
                        return cb(null, node);

                    var upload = uploads[0];

                    req.models.Measurement.find({'upload':upload.id}).only('data', 'id').run(function(err, measurements){
                        if (err)
                            return cb(err);

                        var last_upload = {
                            ts : upload.ts,
                            measurements : measurements.map(function(m){
                                return m.data;
                            })
                        };

                        HAL.link(last_upload, 'self', '/uploads/'.concat(upload.id));

                        node.last_upload = last_upload;

                        return cb(null, node);
                    });
                });
            }, function(err, doc){
                if (err)
                    return res.send(400, err);
                return res.send(doc);
            });
        });
    });

    app.get('/nodes/:node_id', function(req, res){
        req.models.Node.get(req.params.node_id, function(err, node){
            if (err)
                return res.send(400, err);

            HAL.link(node, 'self', '/nodes/'.concat(node.id));

            var q_upload = req.models.Upload
                .find({'node':node.id})
                .order('ts', 'Z')
                .limit(req.page.limit)
                .offset(req.page.offset)
            ;
            
            q_upload.run(function(err, uploads){
                if (err)
                    return res.send(400, err);

                var handleUpload = function(upload, cb) {
                    HAL.link(upload, 'self', '/uploads/'.concat(upload.id));
                    HAL.embed(node, 'upload', upload);

                    req.models.Measurement.find({'upload':upload.id})
                        .run(function(err, ms){
                            if (err)
                                cb(err);

                            ms.forEach(function(m){
                                HAL.link(m, 'self', '/measurements/'.concat(m.id));
                                HAL.embed(upload, 'measurement', m);
                            });

                            cb();
                        });
                };

                async.each(uploads, handleUpload, function(err){
                    if (err)
                        res.send(400, err);

                   res.send(node);
                });
            });
        });
    });

    /*
    app.get('/nodes/:node_id', function(req, res){
        req.models.Node.get(req.params.node_id, function(err, node){
            if (err)
                return res.send(404, err);

            HAL.links(node, req, {
                'uploads' : { href : util.format('/nodes/%d/uploads', node.id) }
            });

            res.send(node);
        });
    });

    app.get('/nodes/:node_id/uploads', function(req, res){
        req.models.Upload.find({node:req.params.node_id}).only('ts', 'id').run(function(err, uploads){
            if (err)
                return res.send(404, err);

            var doc = {
                count : uploads.length
            };

            var upload_links = uploads.map(function(upload){
                return {
                    href : util.format('/uploads/%d', upload.id)
                  , title : upload.ts.toISOString()
                };
            });
            HAL.links(doc, req, {
                upload : upload_links
            });

            res.send(doc);
        });
    });
    
    app.get('/uploads/:upload_id', function(req, res){
        req.models.Measurement.find({upload:req.params.upload_id}).only('id', 'data').run(function(err, measurements){
            if (err)
                return res.send(404, err);

            var doc = {
                count : measurements.length
            };

            var measurement_links = measurements.map(function(m){
                return {
                    href : util.format('/measurements/%d', m.id)
                  , title : m.data.type
                };
            });
            HAL.links(doc, req, {
                measurement : measurement_links
            });

            res.send(doc);
        });
    });

    app.get('/measurements/:m_id', function(req, res){
        req.models.Measurement.get(req.params.m_id, function(err, measurement){
            if (err)
                return res.send(404, err);

            HAL.links(measurement, req);

            res.send(measurement);
        });
    });
    */
};
 