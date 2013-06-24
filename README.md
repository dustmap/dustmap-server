dustmap-server
=

Install / Run
-
    git clone git://github.com/dustmap/dustmap-server
    cd dustmap-server
    cp database.json.example database.json
    $EDITOR database.json
    export NODE_ENV=<the_environment>
    node_modules/.bin/db-migrate --env=$NODE_ENV up
    npm start

What is this?
-
This is the server component for the dustmap.org project. The project's goal is to

 - develop and deploy el-cheapo hardware (raspberrypi, arduino, ...) to measure environmental data (especially particulate matter)
 - develop software for measuring, transfering, storing and visualizing the recorded data

Every outcome of the project whatsoever should be as open as possible (read: open data, open source software, open hardware, ...)

If you are interested in any of the stuff we (try to) do, feel free to drop us a line at team@dustmap.org ...

Hints
-
 - Tests are currently not working, should come back soon
 - You need to setup the connection to your database in `database.json` in the root of the project
 - You can setup multiple different database connections for different `NODE_ENV`, check out the `database.json.example`
 - We currently use `hstore`. Perhaps this will change in future (we'll perhaps use `JSON` as a datatype as soon as soon as 9.3 is out ... or not)
 - Currently only the upload works ... more coming
 - No Auth/Sign/.../Whatsoever ... coming in future
 - If you need SSL to connect to the database, it seems you need to manually edit the require stanzas for both `node-orm2` and `db-migrate` and thus use the `libpg` bindings
   - `... libpg('pg') ...` -> `require('pg').native ...`

More or less relevant links
-
 - http://dustmap.org/
 - https://github.com/dustmap/
 - https://github.com/hoegaarden/dustnode-dustpi-gpio

TODO
-
 - [x] ORM, DB, ...
 - [x] Ratelimit, Upload Limit
 - [ ] Validation in application
 - [ ] JSON HAL enhancments
 - [ ] Caching DB requests, E-Tags, ...
 - [ ] perhaps patch `pg` to switch between natvie and js mode via environment variable (nedd to look into this ...)
 - [ ] update / delete resources (?)
 - [ ] user / node management
 - [ ] static stuff for single site application (?)
 - [ ] `req.format(...)` and other formats
 - [ ] daemonizing the server

