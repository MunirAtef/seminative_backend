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

        if (term !== "") await userInteractionsCollection.insertOne({
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
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorData"
                }
            },
            {
                $unwind: "$creatorData"
            },
            {
                $project: {
                    _id: 0,
                    id: {$toString: "$_id"},
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
                    createdAt: {$lt: identifierLong},
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "publisher"
                }
            },
            {
                $unwind: "$publisher"
            },
            {
                $project: {
                    _id: 0,
                    // appId: 0,
                    id: {$toString: "$_id"},
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
            },
            { $sort: { createdAt: -1 } },  // Sort descending
            { $limit: limit }
        ])
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
    },


    // history handlers
    getHistory: async ({userId, historyType, identifier, limit}) => {
        const identifierLong = Long.fromNumber(identifier);

        if (historyType === interactionTypes.SEARCH) {
            const historyItems = await userInteractionsCollection
                .find({
                    userId: new ObjectId(userId),
                    type: interactionTypes.SEARCH,
                    createdAt: {$lt: identifierLong},
                })
                .limit(limit)
                .toArray()

            return responses.ok(historyItems.map((historyItem) => {
                const item = {...historyItem};
                item.id = item._id.toString();
                delete item._id;
                delete item.userId;
                return item;
            }));
        }

        const historyItems = await userInteractionsCollection.aggregate([
            {
                $match: {
                    userId: {$eq: new ObjectId(userId)},
                    createdAt: {$lt: identifierLong},
                }
            },
            {
                $lookup: {
                    from: "apps", // Join with apps collection
                    localField: "appId",
                    foreignField: "_id",
                    as: "app"
                }
            },
            {
                $unwind: "$app" // {path: "$app", preserveNullAndEmptyArrays: true}
            },
            {
                $project: {
                    _id: 0, // Remove MongoDB _id
                    id: {$toString: "$_id"}, // Convert _id to string and rename it to "id"
                    type: 1,
                    createdAt: 1,
                    metadata: 1,
                    app: {
                        id: {$toString: "$app._id"},
                        name: "$app.name",
                        iconUrl: "$app.iconUrl"
                    }
                }
            },
            {$sort: {createdAt: -1}},
            {$limit: limit}
        ])
            .toArray();


        // {
        //     "_id": "67c1b0b466f4ea9471e02073",
        //     "userId": "67bf04099fad689bebc2bdb8",
        //     "type": "SEARCH",
        //     "createdAt": 1740746932985,
        //     "metadata": {
        //     "searchTerm": "chat"
        // }
        // },
        //
        // {
        //     "_id": "67c1b0bb66f4ea9471e02074",
        //     "userId": "67bf04099fad689bebc2bdb8",
        //     "appId": "67becd0bed355017e8b5bd46",
        //     "type": "VIEW",
        //     "createdAt": 1740746939389
        // },

        return responses.ok(historyItems);
    },

    deleteHistoryItem: async ({userId, historyType, itemId}) => {
        const result = await userInteractionsCollection.deleteOne({
            _id: new ObjectId(itemId),
            type: historyType,
            userId: new ObjectId(userId)
        });
        if (result.deletedCount === 0) return responses.notFound("History item not found.");
        return responses.ok();
    },

    deleteHistory: async ({userId, historyType}) => {
        const result = await userInteractionsCollection.deleteMany({
            userId: new ObjectId(userId),
            type: historyType,
        });
        console.log(`history deleted items count: ${result.deletedCount}`);
        return responses.ok();
    }
}

module.exports = storeRepo;