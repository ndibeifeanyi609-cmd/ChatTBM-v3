'use strict';

function authenticatedUserId(req) {
    const id = req && req.authUser && req.authUser.id;
    return typeof id === 'string' && id.trim() ? id : null;
}

module.exports = { authenticatedUserId };
