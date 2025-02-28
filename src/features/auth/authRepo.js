const bcrypt = require("bcrypt");
const {usersCollection} = require('../connection.js');
const dateTimeService = require("../../utils/dateTimeService");
const responses = require("../responses");
const {ObjectId} = require("mongodb");


const authRepo = {
    async signup({name, email, password, device, dateOfBirth}) {
        // Check if user already exists
        const existingUser = await usersCollection.findOne({email});
        if (existingUser) return responses.conflict("Email already exists.");

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = dateTimeService.now();

        // Create the user object
        const user = {
            name,
            email,
            password: hashedPassword,
            device,
            createdAt: now,
            lastLoginAt: now
        };

        // Insert into MongoDB
        const result = await usersCollection.insertOne(user);
        user.createdAt = now
        user.lastLoginAt = now
        console.log(result);
        if (result.insertedId) {
            const formattedUser = this.toUserResponse(user)
            formattedUser.createdAt = now;
            return responses.created(formattedUser);
        } else {
            return responses.serverError();
        }
    },

    async login({email, password, device}) {
        const user = await usersCollection.findOne({email});
        if (!user) return responses.badRequest("Invalid email or password.");

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return responses.badRequest("Invalid email or password.");

        if (user.device !== device) return responses.unauthorized("Login restricted for this device.");

        // Update last login timestamp
        await usersCollection.updateOne({_id: user._id}, {$set: {lastLoginAt: dateTimeService.now()}});

        return responses.ok(this.toUserResponse(user));
    },

    async saveRefreshTokenId({userId, tokenId, oldTokenId}) {
        const result = await usersCollection.updateOne(
            {_id: new ObjectId(userId), tokenId: oldTokenId},
            {$set: {tokenId}}
        );
        return result.acknowledged;
    },

    // async verifyTokenId({userId, tokenId}) {
    //     const user = await usersCollection.findOne({_id: new ObjectId(userId)});
    //     if (!user) ;
    //     if (user.tokenId !== tokenId) return responses.unauthorized("Invalid tokens provided.");
    //
    // },

    toUserResponse(dbUser) {
        return {
            id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            createdAt: dbUser.createdAt,
            imageUrl: dbUser.imageUrl
        }
    },
};

module.exports = authRepo;
