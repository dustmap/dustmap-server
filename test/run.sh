#!/usr/bin/env bash

set -e
set -u

export TOP="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export TEST_ID=${TEST_ID:-$(date '+%s'_$RANDOM)}

DIR="${1:-$TOP}"

FILE_PATTERN='*.test.js'
DIR_PATTERN='*_tests'

SOURCE="${DIR}/SETTINGS.sh"
BEGIN="${DIR}/BEGIN.js"
END="${DIR}/END.js"
FAIL="${DIR}/FAIL.js"

NODE="${NODE:-node}"
NODEUNIT="${NODEUNIT:-nodeunit}"

echo
echo "## $TEST_ID :: $DIR ##"
echo

if [ -r "$FAIL" ] ; then trap '"$NODE" "$FAIL"' 1 2 3 15 ERR ; fi
if [ -r "$SOURCE" ] ; then source "$SOURCE" ; fi
if [ -r "$BEGIN" ] ; then "$NODE" "$BEGIN" ; fi

pushd "$DIR" >/dev/null
find . -mindepth 1 -maxdepth 1 -type f -name "$FILE_PATTERN" -print0 |\
    xargs -0 -r -n 1 "$NODEUNIT"
popd >/dev/null

find "$DIR" -mindepth 1 -maxdepth 1 -type d -name "$DIR_PATTERN" -print0 |\
    xargs -0 -r -n 1 "$0"

if [ -r "$END" ] ; then "$NODE" "$END" ; fi


