
const responses = {
    ok: (data = null) => {
        return {
            success: true,
            data,
            status: 200
        }
    },
    created: (data = null) => {
        return {
            success: true,
            data,
            status: 201
        }
    },

    badRequest: (message = "Invalid request sent.") => {
        return {
            success: false,
            message,
            status: 401
        }
    },
    unauthorized: (message = "Unauthorized access to this resource.") => {
        return {
            success: false,
            message,
            status: 403
        }
    },
    notFound: (message = "Resource is not found.") => {
        return {
            success: false,
            message,
            status: 404
        }
    },
    conflict: (message = "This unique identifier is already exists.") => {
        return {
            success: false,
            message,
            status: 409
        }
    },
    serverError: (message = "Exception happened while processing your request.") => {
        return {
            success: false,
            message,
            status: 500
        }
    }
}

module.exports = responses;