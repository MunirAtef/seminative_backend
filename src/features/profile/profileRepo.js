const {usersCollection} = require('../connection');
const {ObjectId} = require("mongodb");
const responses = require("../responses");
const bcrypt = require('bcrypt');


const profileRepo = {
    getProfile: async ({userId}) => {
        const user = await usersCollection.findOne({_id: new ObjectId(userId)});
        if (!user) return responses.notFound("User not found.");

        return responses.ok({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            createdAt: user.createdAt,
        });
    },

    updateName: async ({userId, name}) => {
        const result = await usersCollection.updateOne(
            {_id: new ObjectId(userId)},
            {$set: {name}}
        );
        if (result.matchedCount === 0) return responses.notFound("User not found.");
        return responses.ok();
    },

    changeProfilePicture: async ({userId, filename = null}) => {
        const result = await usersCollection.updateOne(
            {_id: new ObjectId(userId)},
            {$set: {imageUrl: filename}}
        );
        if (result.matchedCount === 0) return responses.notFound("User not found.");
        return responses.ok(filename);
    },

    updatePassword: async ({userId, oldPassword, newPassword}) => {
        const user = await usersCollection.findOne({_id: new ObjectId(userId)});
        if (!user) return responses.notFound("User not found.");

        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) return responses.unauthorized("Incorrect old password.");

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await usersCollection.updateOne(
            {_id: new ObjectId(userId)},
            {$set: {password: hashedPassword}}
        );
        return responses.ok();
    }
};

module.exports = profileRepo;
