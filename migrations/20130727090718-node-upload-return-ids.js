"use strict";

var here = require('here').here;

exports.up = function(db, cb) {
    var stmt = here(/*

drop view node_uploads;

create view node_uploads as
    select
        nodes.id as node_id
      , nodes.name as node_name
      , uploads.id as upload
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

      NEW.node_id = node_id;
      NEW.upload = upload_id;

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
    var stmt = here(/*

drop view node_uploads;

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
