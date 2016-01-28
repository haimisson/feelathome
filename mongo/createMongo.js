print('Database:');
db = db.getSiblingDB("feelathome");
printjson(db.getName());


// delete non-system collections
print('deleting non-system collections');
db.getCollectionNames().forEach(function (c) {
    if (c.indexOf("system.") == -1) db[c].drop();
});

// create db and collections
print('creating collections');
db.createCollection("sensorvalues", {autoIndexId: true});
db.createCollection("log1", {autoIndexId: true});
db.createCollection("log2", {autoIndexId: true});

print('collections created:');
printjson(db.getCollectionNames());

print('inserting data');
db.sensorvalues.insert({"timestamp" : ISODate("2016-01-06T13:35:46.303Z"), "tempIn" : 21, "airQ": 90});
db.sensorvalues.insert({"timestamp" : ISODate("2016-01-06T16:35:46.303Z"), "tempIn" : 21, "airQ": 90});
db.sensorvalues.insert({"timestamp" : ISODate("2016-01-07T13:35:46.303Z"), "tempIn" : 21, "airQ": 90});
db.sensorvalues.insert({"timestamp" : ISODate("2016-01-07T16:35:46.303Z"), "tempIn" : 21, "airQ": 90});
db.sensorvalues.insert({"timestamp" : ISODate("2016-01-08T13:35:46.303Z"), "tempIn" : 21, "airQ": 90});
db.sensorvalues.insert({"timestamp" : ISODate("2016-01-08T16:35:46.303Z"), "tempIn" : 21, "airQ": 90});
db.sensorvalues.insert({"timestamp" : ISODate("2016-01-09T13:35:46.303Z"), "tempIn" : 21, "airQ": 90});
db.sensorvalues.insert({"timestamp" : ISODate("2016-01-09T16:35:46.303Z"), "tempIn" : 21, "airQ": 90});