const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Form11 = sequelize.define('form11',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    relationship:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    is_member_of_pf:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    is_member_of_pension:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    uan:{
        type: Sequelize.STRING,
    },
    pf_member_id:{
        type: Sequelize.STRING,
    },
    date_of_exit:{
        type: Sequelize.STRING,
    },
    scheme_certificate_number:{
        type: Sequelize.STRING,
    },
    ppo_number:{
        type: Sequelize.STRING,
    },
    is_international_worker:{
        type: Sequelize.STRING,
    },
    country_of_origin:{
        type: Sequelize.STRING,
    },
    passport_number:{
        type: Sequelize.STRING,
    },
    passport_valid_from:{
        type: Sequelize.STRING,
    },
    passport_valid_till:{
        type: Sequelize.STRING,
    },
    educational_qualification:{
        type: Sequelize.STRING,
    },
    is_specially_abled:{
        type: Sequelize.STRING,
    },
    specially_abled_category:{
        type: Sequelize.STRING,
    },
    pf_no:{
        type:Sequelize.STRING
    },
    is_kyc_details_uploaded:{
        type: Sequelize.STRING,
    },
    is_kyc_details_approved:{
        type: Sequelize.STRING,
    },
    place:{
        type: Sequelize.STRING,
    },   
    date:{
        type: Sequelize.DATEONLY,
    },
});

module.exports = Form11;
