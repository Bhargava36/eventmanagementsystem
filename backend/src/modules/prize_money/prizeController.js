const eventPrizesService = require("./prizeServices");
const { recordMutation } = require("../security/auditService");
const addPrizes = (req, res) => {
    const eventId = req.params.eventId;
    const { prizes } = req.body;
    if (!eventId) {
        return res.status(400).json({
            message: "Event ID is required"
        });
    }
    if (prizes.length === 0) {
        return res.status(400).json({
            message: "At least one prize is required"
        });
    }
    eventPrizesService.addPrizes(eventId, prizes, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            recordMutation({
                actor: req.user,
                module: 'prize_money',
                action: 'ADD_PRIZES',
                entityType: 'event_prize',
                eventId: eventId,
                newState: { prizes },
                req
            });
            res.status(201).json({
                message: "Prizes added successfully",
                result
            });
        }
    );
};
const getPrizesByEvent = (req, res) => {
    const eventId = req.params.eventId;
    if (!eventId) {
        return res.status(400).json({
            message: "Event ID is required"
        });
    }
    eventPrizesService.getPrizesByEvent(eventId, (err, prizes) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            res.status(200).json({
                prizes
            });
        }
    );
};
const getPrizeById = (req, res) => {
    const prizeId = req.params.id;
    eventPrizesService.getPrizeById(prizeId, (err, prize) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            if (!prize) {
                return res.status(404).json({
                    message: "Prize not found"
                });
            }
            res.status(200).json({
                prize
            });
        }
    );
};
const updatePrize = (req, res) => {
    const prizeId = req.params.id;
    const { prize } = req.body;
    if (!prize) {
        return res.status(400).json({
            message: "Prize money is required"
        });
    }
    eventPrizesService.updatePrize(prizeId, prize, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Prize not found"
                });
            }
            recordMutation({
                actor: req.user,
                module: 'prize_money',
                action: 'UPDATE_PRIZE',
                entityType: 'event_prize',
                entityId: prizeId,
                newState: { prize },
                req
            });
            res.status(200).json({
                message: "Prize updated successfully",
                result
            });
        }
    );
};
const deletePrize = (req, res) => {
    const prizeId = req.params.id;
    eventPrizesService.deletePrize(prizeId, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Prize not found"
                });
            }
            recordMutation({
                actor: req.user,
                module: 'prize_money',
                action: 'DELETE_PRIZE',
                entityType: 'event_prize',
                entityId: prizeId,
                req
            });
            res.status(200).json({
                message: "Prize deleted successfully",
                result
            });
        }
    );
};
module.exports = {
    addPrizes,
    getPrizesByEvent,
    getPrizeById,
    updatePrize,
    deletePrize
};
