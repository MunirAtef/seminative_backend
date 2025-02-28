
const publisherRepo = require(`./publisherRepo`);

const publisherController = {
    publisherProfile: async (req, res) => {
        const id = req.params.id;
        const result = await publisherRepo.getProfile(id)

        res.status(result.status).json(result.data);
    }
}

module.exports = publisherController;
