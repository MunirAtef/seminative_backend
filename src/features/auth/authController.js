const jwt = require('jsonwebtoken');
const authRepo = require('./authRepo')
const dateTimeService = require("../../utils/dateTimeService");
const responses = require("../responses");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const generateCustomId = () => {
    const timestamp = dateTimeService.now();
    const timestampBase64 = Buffer.from(timestamp.toString()).toString('base64');
    const randomBase64 = Buffer.from(Math.random().toString(36).slice(2, 6)).toString('base64');
    return timestampBase64 + randomBase64;
}

const authController = {
    generateTokens: (userId) => {
        // await authRepo.generateRefreshToken(user);
        const tokenId = generateCustomId();
        // const updated = await authRepo.saveRefreshTokenId({userId: userId, tokenId, oldTokenId});
        // if (!updated) return null

        console.log("tokenId", tokenId);

        const accessToken = jwt.sign({id: userId, tokenId}, ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        });

        const refreshToken = jwt.sign({id: userId, tokenId}, REFRESH_TOKEN_SECRET, {
            expiresIn: '8765h',
        });

        return {
            accessToken,
            refreshToken,
        }
    },

    // Signup Controller
    signup: async (req, res) => {
        try {
            const {name, email, password, device} = req.body;
            const result = await authRepo.signup({name, email, password, device});

            if (!result.success) return res.status(result.status).json(result);

            // Generate JWT token
            const tokens = authController.generateTokens(result.data.id);
            const okResult = responses.created({tokens, profile: result.data})
            res.status(okResult.status).json(okResult);
        } catch (error) {
            console.error("Signup error:", error);
            const failedResult = responses.serverError()
            res.status(failedResult.status).json(failedResult);
        }
    },

    // Login Controller
    login: async (req, res) => {
        try {
            const {email, password, device} = req.body;
            const result = await authRepo.login({email, password, device});

            if (!result.success) return res.status(result.status).json(result);

            const tokens = authController.generateTokens(result.data.id);
            const okResult = responses.created({tokens, profile: result.data});
            res.status(okResult.status).json(okResult);
        } catch (error) {
            console.error("Login error:", error);
            const failedResult = responses.serverError()
            res.status(failedResult.status).json(failedResult);
        }
    },

    refreshToken: async (req, res) => {
        const failedResult = responses.unauthorized("Invalid tokens provided.");

        try {
            const {refreshToken, expiredAccessToken} = req.body;
            // const refreshToken = req.headers.refreshToken;
            // const expiredAccessToken = req.headers.expiredAccessToken;

            // id, tokenId
            const {id, tokenId} = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const accessData = jwt.decode(expiredAccessToken, ACCESS_TOKEN_SECRET);
            console.log(accessData);
            console.log(id, tokenId);

            if (accessData.id !== id || accessData.tokenId !== tokenId)
                res.status(failedResult.status).json(failedResult);

            const tokens = authController.generateTokens(id);
            if (!tokens) res.status(failedResult.status).json(failedResult);
            else res.status(200).json(tokens);
        } catch (error) {
            res.status(failedResult.status).json(failedResult);
        }
    }
};


module.exports = authController;