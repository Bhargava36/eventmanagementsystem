const leadService = require('../teamlead/teamleadServices');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createTeamLead = (req, res) => {
    const {LeadName, Email, Password, College, Location, State } = req.body;

    if( !LeadName || !Email || !Password || !College || !Location || !State) {
        return res.status(400).json({message: "All fields are required"});
    }

    leadService.createTeamLead(LeadName, Email, Password, College, Location, State, (err, result) => {
        if(err){
            return res.status(500).json({
                message: "Registration failed",
                error: err
            });
        }
        else {
            return res.status(201).json({
                message: "TeamLead Registered Successfully!",
            });
        }
    });
};

const loginTeamLead = (req, res) => {
    const {Email, Password} = req.body;

    if(!Email || !Password){
        return res.status(400).json({
            message: "All fields are required, Check it once"
        });
    }

    leadService.loginTeamLead(Email, async(err, result) => {
        if(err){
            return res.status(500).json({
                message: "Database error",
                error: err
            });
        }
        
        if(result.length === 0){
            return res.status(401).json({
                message: "Invalid UserName or Password"
            });
        }
        const teamlead = result[0];

        const isMatch = await bcrypt.compare(Password, teamlead.Password);
        
        if(!isMatch) {
             return res.status(401).json({
                message: "Invalid UserName or Password"
            });
        }

        const token = jwt.sign(
            {
            Id: teamlead.Id,
            LeadName: teamlead.LeadName,
            role: "teamlead" 
            },
            process.env.JWT_SECRECT,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );
        return res.status(200).json({
            message:"Login Successful",
            token,
            teamlead: {
                Id: teamlead.Id,
                LeadName: teamlead.LeadName,
                Email: teamlead.Email,
                College: teamlead.College,
                Location: teamlead.Location,
                State: teamlead.State
            }
        });
    });
};

const getAllTeamLead = (req, res) => {

    leadService.getAllTeamLead((err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Failed to get teamleads",
                error: err
            });
        }

        return res.status(200).json({
            message: "teamleads fetched successfully",
            events: result
        });
    });
};

const getTeamLeadById = (req, res) => {
    const id = req.params.id;
    leadService.getTeamLeadById(id, (err, result) => {
        if(err) {
            return res.status(500).json({
                message: "Failed to get teamlead by id",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "teamlead not found"
            });
        }

        return res.status(200).json({
            message: "teamlead fetched successfully",
            events: result
        });
    });
};

const updateTeamLead = (req, res) => {
    const { id } = req.params;
    const { LeadName, Email, College, Location, State } = req.body;

    leadService.updateTeamLead(id, LeadName, Email, College, Location, State, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to update teamlead",
                error: err
            });
        }

        return res.status(200).json({
            message: "Teamlead updated successfully",
            teamlead: result
        });
    });
};

module.exports = {
    createTeamLead,
    loginTeamLead,
    getAllTeamLead,
    getTeamLeadById,
    updateTeamLead
};