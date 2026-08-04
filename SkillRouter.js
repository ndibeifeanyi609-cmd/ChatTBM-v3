// =====================================
// ChatTBM V7.1
// Skill Router
//
// Purpose:
// - Receive AI Core decisions
// - Route requests to skills
// - Manage future AI abilities
// =====================================


// =====================================
// SKILL REGISTRY
// =====================================

const SkillRouter = {

    version: "7.1",

    skills: {

        general: "General Assistant",

        coding: "Coding Assistant",

        creator: "Creator Assistant",

        writing: "Writing Assistant",

        business: "Business Assistant",

        education: "Learning Assistant"

    }

};


// =====================================
// ROUTE REQUEST
// =====================================

function routeSkill(intent) {


    switch(intent) {


        case "coding":

            return SkillRouter.skills.coding;


        case "creator":

            return SkillRouter.skills.creator;


        case "business":

            return SkillRouter.skills.business;


        case "education":

            return SkillRouter.skills.education;


        case "writing":

            return SkillRouter.skills.writing;


        default:

            return SkillRouter.skills.general;

    }

}


// =====================================
// ADD FUTURE SKILL
// =====================================

function registerSkill(name, description) {


    SkillRouter.skills[name] = description;


    console.log(
        "New skill added:",
        name
    );

}


// =====================================
// GET AVAILABLE SKILLS
// =====================================

function getSkills() {

    return SkillRouter.skills;

}


// =====================================
// GLOBAL ACCESS
// =====================================

window.ChatTBMSkillRouter = {

    routeSkill,

    registerSkill,

    getSkills

};


console.log(
    "✅ ChatTBM Skill Router Loaded"
);
