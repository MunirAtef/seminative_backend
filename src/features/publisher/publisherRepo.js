const {appsCollection, usersCollection} = require("../connection")
const {ObjectId} = require("mongodb");
const responses = require("../responses");

const publisherRepo = {
    getProfile: async (id) => {
        try {
            const apps = await appsCollection.find({creatorId: new ObjectId(id)}).toArray();

            const publisherApps = apps.map(app => {
                const cloned = {...app};
                cloned.id = app._id.toString();
                delete cloned.creatorId;
                delete cloned._id;
                return cloned;
            });

            const publisher = await usersCollection.findOne({_id: new ObjectId(id)})

            const profile = {
                id: publisher._id.toString(),
                name: publisher.name,
                email: publisher.email,
                imageUrl: publisher.imageUrl,
                products: publisherApps
            }

            console.log(profile);
            return responses.ok(profile);
        } catch (e) {
            return responses.serverError();
        }
    }
}

module.exports = publisherRepo;