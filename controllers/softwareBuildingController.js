'use strict';

const {
    createBuild,
    delegateBuildReasoning
} = require('../softwareBuilder/SoftwareBuildingAssistant');

async function softwareBuildingHandler(req, res) {
    try {
        const request = req.body;

        const buildResult = createBuild(request);

        if (!buildResult.valid) {
            const statusCode =
                buildResult.error?.code === 'UNAUTHORIZED_OPERATION'
                    ? 401
                    : 400;

            return res.status(statusCode).json({
                success: false,
                error: buildResult.error
            });
        }

        const delegationResult =
            await delegateBuildReasoning(buildResult.build);

        if (!delegationResult.valid) {
            return res.status(503).json({
                success: false,
                error: delegationResult.error
            });
        }

        return res.json({
            success: true,
            build: buildResult.build,
            delegation: delegationResult.delegation
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Unable to process software-building request.',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined
        });
    }
}

module.exports = {
    softwareBuildingHandler
};
