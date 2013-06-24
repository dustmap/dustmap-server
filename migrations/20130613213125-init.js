var dbm = require('db-migrate');
var here = require('here').here;
var async = require('async');

exports.up = function(db, cb) {
    var stmt = here(/*

create table nodes (
    id serial not null
  , name text not null
  , owner text not null  -- just text for now
  , primary key ( id )
);

create table uploads (
    id serial not null
  , node integer not null
      references nodes(id)
  , ts timestamp without time zone not null default now()  -- all UTC
  , primary key ( id )
  , unique ( node , ts )
);

create table measurements (
    id serial not null
  , upload integer not null
      references uploads( id )
  , data hstore not null
  , primary key ( id )
  , unique ( upload, data )

  , constraint "data needs a value"
      check ( data ? 'value' )
  , constraint "data value must be numeric"
      check ( (data->'value')::numeric is not null )
  , constraint "data needs a type"
      check ( data ? 'type' )
);
create index on measurements ( data );

create view node_uploads as
    select
        nodes.id as node_id
      , nodes.name as node_name
      , uploads.ts as ts
      , measurements.data as data
    from
        nodes
            left join uploads on nodes.id = uploads.node
            left join measurements on uploads.id = measurements.upload
    where
        data is not null
;

create or replace function changeNodeUploads()
returns trigger
language plpgsql as $code$
  declare
    node_id nodes.id%TYPE;
    upload_id uploads.id%TYPE;
  begin
    if TG_OP = 'INSERT' then
      -- get node_id, perhaps insert a node beforehand
      if not exists (select 1 from nodes where name = NEW.node_name) then
        insert into nodes(name, owner) values(NEW.node_name, 'unknown')
          returning id into node_id;
      else
        select id into node_id from nodes where name = NEW.node_name;
      end if;

      -- get the upload_id, perhaps create the upload beforehand
      if not exists (select 1 from uploads where ts = NEW.ts and node = node_id) then
        insert into uploads(ts, node) values(NEW.ts, node_id)
          returning id into upload_id;
      else
        select id into upload_id from uploads where node = node_id and ts = NEW.ts;
      end if;

      -- finally, save the measurement
      insert into measurements(upload, data) values(upload_id, NEW.data);

      return NEW;
    elsif TG_OP = 'UPDATE' then
      raise exception 'Update not allowed, update the underlying tables';
      return NEW;
    elsif TG_OP = 'DELETE' then
      raise exception 'Delete not allowed, delete from the underlying tables';
      return NEW;
    end if;
    return NEW;
  end;
$code$;

create trigger changeNodeUploads_trg
  instead of INSERT or UPDATE or DELETE
  on node_uploads
  for each row execute procedure changeNodeUploads()
;

*/).valueOf();

    db.runSql(stmt, cb);
};

exports.down = function(db, cb) {
    async.series([
        db.runSql.bind(db, 'drop view node_uploads')
      , db.runSql.bind(db, 'drop function changeNodeUploads()')
      , db.dropTable.bind(db, 'measurements')
      , db.dropTable.bind(db, 'uploads')
      , db.dropTable.bind(db, 'nodes')
    ], cb);
}
