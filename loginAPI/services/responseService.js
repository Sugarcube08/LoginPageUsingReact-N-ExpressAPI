exports.createResponse = ({statusCode, message, data, meta}) => {
    const response = {
        data: data? data : null,
        message: message? message : null,
        status: statusCode? statusCode : null,
        meta: meta? meta : null
    }
    return response
}