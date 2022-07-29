const statusMessage = {
    '200': 'Done',
    '201': 'Created',
    '400': 'Invalid Format',
    "401": "Unauthorized",
    "403": "Forbidden",
    '500': 'Internal Error'
}

exports.success = function (req, res, isError, isSucces, message, status) {

    res.status(status || 200).send({
        code:status,
        error: isError,
        succes: isSucces,
        body: message
        
    });
}

exports.error = function (req, res, isError, isSucces, message, status, details) {
    console.error('[response error] ' + details);

    res.status(status).send({
        code:status,
        error: isError,
        succes: isSucces,
        body: message
    });
}