const {appsCollection, userInteractionsCollection, appReviewsCollection, usersCollection} = require("../connection")
const {ObjectId, Long} = require("mongodb");
const dateTimeService = require("../../utils/dateTimeService");
const responses = require("../responses");

const interactionTypes = {
    SEARCH: "SEARCH",
    VIEW: "VIEW",
    DOWNLOAD: "DOWNLOAD"
}

const storeRepo = {
    // GET search suggestions
    searchSuggestions: async ({userId, term}) => {
        let appNames;
        if (term === null || term === "") {
            appNames = (await userInteractionsCollection
                .find(
                    {userId: new ObjectId(userId), type: interactionTypes.SEARCH},
                    {projection: {_id: 0, metadata: 1, createdAt: 1}}
                )
                .sort({createdAt: -1}) // Sort by _id in descending order (latest first)
                .limit(10)
                .toArray())
                .map(doc => doc.metadata.searchTerm);
        } else {
            appNames = (await appsCollection
                .find(
                    {name: {$regex: term, $options: "i"}},  // Case-insensitive search
                    {projection: {_id: 0, name: 1}} // Only return the name field
                )
                .limit(10)  // Limit results to 10 suggestions
                .toArray())
                .map(doc => doc.name);
        }

        return responses.ok(appNames);
    },

    // GET search results
    search: async ({userId, term}) => {
        // const apps = await appsCollection.find({ name: { $regex: term, $options: "i" } }).toArray();

        await userInteractionsCollection.insertOne({
            userId: new ObjectId(userId),
            type: interactionTypes.SEARCH,
            createdAt: dateTimeService.now(),
            metadata: {
                searchTerm: term
            }
        });

        // Aggregation pipeline with $lookup to join users collection
        const apps = await appsCollection.aggregate([
            {
                $match: {
                    name: {$regex: term, $options: "i"}
                }
            },
            {
                $lookup: {
                    from: "users", // Join with users collection
                    localField: "creatorId", // Field in apps collection
                    foreignField: "_id", // Field in users collection
                    as: "creatorData" // Result array field
                }
            },
            {
                $unwind: "$creatorData" // Convert array to object (if creator exists)
            },
            {
                $project: {
                    _id: 0, // Remove MongoDB _id
                    id: {$toString: "$_id"}, // Convert _id to string and rename it to "id"
                    name: 1,
                    iconUrl: 1,
                    lastVersion: 1,
                    creator: {
                        id: {$toString: "$creatorData._id"},
                        name: "$creatorData.name",
                        imageUrl: "$creatorData.imageUrl",
                        isVerified: "$creatorData.isVerified",
                        isOrg: "$creatorData.isOrg"
                    },
                    size: 1,
                    downloads: 1,
                    minAge: 1,
                    ratings: 1
                }
            }
        ]).toArray();

        return responses.ok(apps)
    },

    // GET app details
    appDetails: async ({userId, appId}) => {
        await userInteractionsCollection.insertOne({
            userId: new ObjectId(userId),
            appId: new ObjectId(appId),
            type: interactionTypes.VIEW,
            createdAt: dateTimeService.now(),
        });
        console.log(appId);

        const app = await appsCollection.findOne({_id: new ObjectId(appId)});
        if (!app)
            return responses.notFound("App is not found.");

        app.id = app._id.toString();
        const creatorId = app.creatorId
        delete app._id;
        delete app.creatorId

        const creator = await usersCollection.findOne({_id: new ObjectId(creatorId)});
        const formattedApp = {
            ...app,
            creator: {
                id: creator._id,
                name: creator.name,
                imageUrl: creator.imageUrl,
                isVerified: creator.isVerified
            }
        };

        return responses.ok(formattedApp);
    },

    getReviews: async ({appId, identifier, limit}) => {
        const identifierLong = Long.fromNumber(identifier);

        const reviews = await appReviewsCollection.aggregate([
            {
                $match: {
                    appId: {$eq: new ObjectId(appId)},
                    createdAt: {$gt: identifierLong},
                }
            },
            {
                $lookup: {
                    from: "users", // Join with users collection
                    localField: "userId", // Field in apps collection
                    foreignField: "_id", // Field in getReviews collection
                    as: "publisher" // Result array field
                }
            },
            {
                $unwind: "$publisher" // Convert array to object (if creator exists)
            },
            {
                $project: {
                    _id: 0, // Remove MongoDB _id
                    // appId: 0,
                    id: {$toString: "$_id"}, // Convert _id to string and rename it to "id"
                    content: 1,
                    rate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    publisher: {
                        id: {$toString: "$publisher._id"},
                        name: "$publisher.name",
                        imageUrl: "$publisher.imageUrl",
                        isVerified: "$publisher.isVerified",
                        isOrg: "$publisher.isOrg"
                    }
                }
            }
        ])
            // .limit(limit)
            .toArray();

        console.log(reviews);
        console.log("======================================")
        return responses.ok(reviews)
    },

    // POST a review
    postReview: async ({userId, appId, content, rate}) => {
        const index = rate - 1
        if (index < 0 || index > 4) return responses.badRequest("Invalid rate sent.")

        const result = await appReviewsCollection.insertOne({
            userId: new ObjectId(userId),
            appId: new ObjectId(appId),
            content,
            rate,
            createdAt: dateTimeService.now(),
            updatedAt: null
        });

        await appsCollection.updateOne(
            {_id: new ObjectId(appId)},
            {$inc: {[`ratings.${index}`]: 1}}
        )

        if (!result.insertedId)
            return responses.serverError("Unable to post the review.");
        return responses.created(result.insertedId);
    },

    // DELETE a review
    deleteReview: ({userId, appId, reviewId}) => {
    },

    // PUT (edit) a review
    updateReview: ({userId, appId, reviewId, content, rate}) => {
    },

    // GET download file (returns dummy file)
    downloadApp: ({userId, appId}) => {
        // res.send("Dummy file content"); // In a real scenario, use res.sendFile(path_to_file)
    }
}

module.exports = storeRepo;